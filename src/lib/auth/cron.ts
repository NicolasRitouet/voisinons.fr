import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

/**
 * Vercel Cron calls send `Authorization: Bearer <CRON_SECRET>`.
 *
 * Fails closed: an unset secret refuses every caller rather than opening the
 * endpoint, and the answer is the same 401 either way so an unauthenticated
 * probe can't tell a missing secret from a wrong one.
 */
export function isCronRequestAuthorized(authorization: string | null): boolean {
  const secret = env.CRON_SECRET;
  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(authorization);
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}
