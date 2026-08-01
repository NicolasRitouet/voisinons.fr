import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parties, type Party } from "@/lib/db/schema";

export type AdminPartyRef = { partyId: string } | { slug: string };

/**
 * The single place an admin token is compared. Constant-time so response
 * latency can't leak a prefix, and null-safe so a missing token is a plain
 * mismatch rather than a crash.
 */
export function isAdminToken(
  expected: string | null | undefined,
  provided: string | null | undefined
): boolean {
  if (!expected || !provided) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Resolves a party only if the caller holds its admin token.
 *
 * Every admin-gated path goes through here: before this existed the same
 * lookup-and-compare was copy-pasted across ten call sites, so adding an
 * action meant remembering to re-implement the check correctly.
 */
export async function requireAdmin(
  ref: AdminPartyRef,
  token: string | null | undefined
): Promise<Party | null> {
  if (!token) return null;

  const party = await db.query.parties.findFirst({
    where: "partyId" in ref ? eq(parties.id, ref.partyId) : eq(parties.slug, ref.slug),
  });

  if (!party || !isAdminToken(party.adminToken, token)) return null;

  return party;
}
