import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { parties, participants } from "@/lib/db/schema";
import { sendOrganizerReminderEmail } from "@/lib/email";
import { isCronRequestAuthorized } from "@/lib/auth/cron";
import {
  REMINDER_WINDOW_MAX_DAYS,
  REMINDER_WINDOW_MIN_DAYS,
  selectReminders,
} from "@/lib/reminders";

const EMAIL_CONCURRENCY = 10;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const startedAt = Date.now();
  const sent: Array<{ slug: string; bucket: string; days: number }> = [];
  const errors: Array<{ slug: string; error: string }> = [];

  try {
    // One clock for the whole run. Filtering on the database's now() while
    // bucketing on the app's would let clock skew move a party across a window
    // boundary mid-decision.
    const now = new Date();

    const candidates = await db
      .select({
        id: parties.id,
        slug: parties.slug,
        name: parties.name,
        organizerName: parties.organizerName,
        organizerEmail: parties.organizerEmail,
        adminToken: parties.adminToken,
        dateStart: parties.dateStart,
        lastReminderAt: parties.lastReminderAt,
        reminderOptOut: parties.reminderOptOut,
        participantCount: sql<number>`(
          SELECT count(*)::int FROM ${participants}
          WHERE ${participants.partyId} = ${parties.id}
        )`,
      })
      .from(parties)
      .where(
        and(
          eq(parties.reminderOptOut, false),
          gte(parties.dateStart, addDays(now, REMINDER_WINDOW_MIN_DAYS)),
          lte(parties.dateStart, addDays(now, REMINDER_WINDOW_MAX_DAYS))
        )
      );

    const { due, skipped } = selectReminders(candidates, now);

    for (let i = 0; i < due.length; i += EMAIL_CONCURRENCY) {
      const chunk = due.slice(i, i + EMAIL_CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map(({ party, daysUntilParty }) =>
          sendOrganizerReminderEmail({
            to: party.organizerEmail,
            organizerName: party.organizerName,
            partyName: party.name,
            partySlug: party.slug,
            adminToken: party.adminToken,
            partyDate: party.dateStart,
            daysUntilParty,
            participantsCount: party.participantCount,
          })
        )
      );

      const chunkSentIds: string[] = [];
      results.forEach((result, index) => {
        const { party, bucket, daysUntilParty } = chunk[index];
        if (result.status === "rejected") {
          errors.push({ slug: party.slug, error: String(result.reason) });
          return;
        }
        if (!result.value.success) {
          errors.push({
            slug: party.slug,
            error: result.value.error ?? "unknown",
          });
          return;
        }
        chunkSentIds.push(party.id);
        sent.push({
          slug: party.slug,
          bucket: bucket.name,
          days: daysUntilParty,
        });
      });

      // Persist per chunk rather than once at the end: a crash or timeout
      // between the sends and a single trailing UPDATE would re-mail every
      // organizer on the next run.
      if (chunkSentIds.length > 0) {
        await db
          .update(parties)
          .set({ lastReminderAt: now })
          .where(inArray(parties.id, chunkSentIds));
      }
    }

    const report = {
      elapsedMs: Date.now() - startedAt,
      candidates: candidates.length,
      sent: sent.length,
      skipped: skipped.length,
      errors: errors.length,
    };
    console.info("[cron/send-reminders]", report);

    return NextResponse.json(
      { ok: true, ...report, sentDetail: sent, errorDetail: errors },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    // Log the cause server-side; the response stays opaque, like /api/health.
    console.error("[cron/send-reminders] failure:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur lors de l'envoi des relances" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
