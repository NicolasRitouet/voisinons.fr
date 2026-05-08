import { NextRequest, NextResponse } from "next/server";
import { and, gte, inArray, lte, sql } from "drizzle-orm";
import { differenceInDays } from "date-fns";
import { db } from "@/lib/db";
import { parties, participants } from "@/lib/db/schema";
import { sendOrganizerReminderEmail } from "@/lib/email";

const EMAIL_CONCURRENCY = 10;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Adaptive reminder windows. The cron runs daily; a party is eligible if
// it falls into one of these buckets and has no reminder sent in the last
// `cooldownDays` (so a party that hits J-14 then J-7 still gets two mails).
const REMINDER_BUCKETS = [
  { name: "J-14" as const, minDays: 12, maxDays: 15, cooldownDays: 5 },
  { name: "J-7" as const, minDays: 5, maxDays: 8, cooldownDays: 5 },
  { name: "J-3" as const, minDays: 2, maxDays: 4, cooldownDays: 2 },
];

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. In dev we accept
  // the same header so the route stays callable manually for testing.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const sent: Array<{ slug: string; bucket: string; days: number }> = [];
  const skipped: Array<{ slug: string; reason: string }> = [];
  const errors: Array<{ slug: string; error: string }> = [];

  try {
    const now = new Date();

    // The party_id → participant count subquery. Counts the organiser too.
    // We only nudge organisers whose fête is "underbooked" (≤ 2 participants
    // including themselves, i.e. 0 or 1 voisin signed up).
    const eligibleParties = await db
      .select({
        id: parties.id,
        slug: parties.slug,
        name: parties.name,
        organizerName: parties.organizerName,
        organizerEmail: parties.organizerEmail,
        adminToken: parties.adminToken,
        dateStart: parties.dateStart,
        lastReminderAt: parties.lastReminderAt,
        participantCount: sql<number>`(
          SELECT count(*)::int FROM ${participants}
          WHERE ${participants.partyId} = ${parties.id}
        )`,
      })
      .from(parties)
      .where(
        and(
          // dateStart between J-15 and J-2 inclusive (widest window, narrower
          // bucket logic happens below per-row)
          gte(parties.dateStart, sql`now() + interval '2 days'`),
          lte(parties.dateStart, sql`now() + interval '15 days'`)
        )
      );

    type Eligible = (typeof eligibleParties)[number];
    const toSend: Array<{ party: Eligible; bucket: typeof REMINDER_BUCKETS[number]; daysUntilParty: number }> = [];

    for (const party of eligibleParties) {
      const daysUntilParty = differenceInDays(party.dateStart, now);

      const bucket = REMINDER_BUCKETS.find(
        (b) => daysUntilParty >= b.minDays && daysUntilParty <= b.maxDays
      );

      if (!bucket) {
        skipped.push({ slug: party.slug, reason: `outside-bucket (J-${daysUntilParty})` });
        continue;
      }

      if (Number(party.participantCount) > 2) {
        skipped.push({ slug: party.slug, reason: "already-engaged" });
        continue;
      }

      if (party.lastReminderAt) {
        const daysSinceReminder = differenceInDays(now, party.lastReminderAt);
        if (daysSinceReminder < bucket.cooldownDays) {
          skipped.push({
            slug: party.slug,
            reason: `cooldown (${bucket.cooldownDays}d, last sent ${daysSinceReminder}d ago)`,
          });
          continue;
        }
      }

      toSend.push({ party, bucket, daysUntilParty });
    }

    // Send in bounded-concurrency chunks so 50 mail sends don't serialise to
    // 25s+ (each Resend call is ~500ms). EMAIL_CONCURRENCY caps in-flight
    // requests to stay friendly to Resend rate limits.
    const sentIds: string[] = [];
    for (let i = 0; i < toSend.length; i += EMAIL_CONCURRENCY) {
      const chunk = toSend.slice(i, i + EMAIL_CONCURRENCY);
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
            participantsCount: Number(party.participantCount),
          })
        )
      );

      results.forEach((r, idx) => {
        const { party, bucket, daysUntilParty } = chunk[idx];
        if (r.status === "rejected") {
          errors.push({ slug: party.slug, error: String(r.reason) });
          return;
        }
        if (!r.value.success) {
          errors.push({ slug: party.slug, error: r.value.error ?? "unknown" });
          return;
        }
        sentIds.push(party.id);
        sent.push({ slug: party.slug, bucket: bucket.name, days: daysUntilParty });
      });
    }

    if (sentIds.length > 0) {
      await db
        .update(parties)
        .set({ lastReminderAt: now })
        .where(inArray(parties.id, sentIds));
    }

    return NextResponse.json(
      {
        ok: true,
        elapsedMs: Date.now() - startedAt,
        eligible: eligibleParties.length,
        sent,
        skipped,
        errors,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[cron/send-reminders] failure:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
