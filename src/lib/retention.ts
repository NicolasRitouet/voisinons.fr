import { and, eq, inArray, isNotNull, lt, ne } from "drizzle-orm";
import { del, list } from "@vercel/blob";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

/** Announced in /confidentialite. Changing it means changing that page too. */
export const RETENTION_DAYS = 30;

const VERCEL_BLOB_HOST = ".public.blob.vercel-storage.com";
const DAY_MS = 24 * 60 * 60 * 1000;

// A blob uploaded moments ago belongs to a form still being filled in: its
// party row doesn't exist yet. Only sweep once that window has closed.
const ORPHAN_GRACE_MS = DAY_MS;

export interface PurgeReport {
  partiesDeleted: number;
  coversDeleted: number;
  orphanCoversDeleted: number;
}

function isOwnBlob(url: string | null): url is string {
  return Boolean(url && url.includes(VERCEL_BLOB_HOST));
}

async function deleteBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.warn("[retention] failed to delete blob:", url, error);
    return false;
  }
}

/**
 * Drops every party whose date is older than the retention window. Participants,
 * needs, contributions, channels and updates follow through ON DELETE cascade.
 */
export async function purgeExpiredParties(
  now: Date = new Date()
): Promise<Pick<PurgeReport, "partiesDeleted" | "coversDeleted">> {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS);

  const expired = await db
    .select({ id: parties.id, coverImageUrl: parties.coverImageUrl })
    .from(parties)
    .where(lt(parties.dateStart, cutoff));

  if (expired.length === 0) {
    return { partiesDeleted: 0, coversDeleted: 0 };
  }

  await db.delete(parties).where(
    inArray(
      parties.id,
      expired.map((party) => party.id)
    )
  );

  // Rows first, blobs second: a failure here leaves a stray file that the
  // orphan sweep will pick up, whereas the reverse would leave live parties
  // pointing at deleted images.
  let coversDeleted = 0;
  const covers = new Set(
    expired.map((party) => party.coverImageUrl).filter(isOwnBlob)
  );

  for (const url of covers) {
    // The same URL can legitimately sit on another, still-live party — see the
    // guard in updatePartyDetails.
    const stillReferenced = await db.query.parties.findFirst({
      where: eq(parties.coverImageUrl, url),
      columns: { id: true },
    });
    if (stillReferenced) continue;

    if (await deleteBlob(url)) coversDeleted++;
  }

  return { partiesDeleted: expired.length, coversDeleted };
}

/**
 * Removes cover blobs that no party references — uploads abandoned before the
 * create form was submitted.
 */
export async function purgeOrphanCovers(now: Date = new Date()): Promise<number> {
  const referenced = new Set(
    (
      await db
        .select({ url: parties.coverImageUrl })
        .from(parties)
        .where(isNotNull(parties.coverImageUrl))
    ).map((row) => row.url)
  );

  const staleBefore = now.getTime() - ORPHAN_GRACE_MS;
  let cursor: string | undefined;
  let deleted = 0;

  do {
    const page = await list({ prefix: "party-cover/", cursor, limit: 1000 });

    for (const blob of page.blobs) {
      if (blob.uploadedAt.getTime() >= staleBefore) continue;
      if (referenced.has(blob.url)) continue;

      if (await deleteBlob(blob.url)) deleted++;
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return deleted;
}

export async function runRetentionPurge(
  now: Date = new Date()
): Promise<PurgeReport> {
  const { partiesDeleted, coversDeleted } = await purgeExpiredParties(now);
  const orphanCoversDeleted = await purgeOrphanCovers(now);

  return { partiesDeleted, coversDeleted, orphanCoversDeleted };
}

/**
 * Deletes one party on the organizer's request (RGPD right to erasure).
 * Returns false when the token doesn't match.
 */
export async function deletePartyById(
  partyId: string,
  adminToken: string
): Promise<{ slug: string } | null> {
  const party = await requireAdmin({ partyId }, adminToken);
  if (!party) return null;

  await db.delete(parties).where(eq(parties.id, partyId));

  if (isOwnBlob(party.coverImageUrl)) {
    const stillReferenced = await db.query.parties.findFirst({
      where: and(
        eq(parties.coverImageUrl, party.coverImageUrl),
        ne(parties.id, partyId)
      ),
      columns: { id: true },
    });
    if (!stillReferenced) await deleteBlob(party.coverImageUrl);
  }

  return { slug: party.slug };
}
