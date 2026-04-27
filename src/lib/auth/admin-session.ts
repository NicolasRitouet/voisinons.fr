import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";

const COOKIE_PREFIX = "vp_admin_";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function cookieName(slug: string): string {
  return `${COOKIE_PREFIX}${slug}`;
}

export async function setAdminSessionCookie(slug: string, token: string): Promise<void> {
  const store = await cookies();
  store.set(cookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getAdminTokenFromCookie(slug: string): Promise<string | null> {
  const store = await cookies();
  return store.get(cookieName(slug))?.value ?? null;
}

export async function clearAdminSessionCookie(slug: string): Promise<void> {
  const store = await cookies();
  store.delete(cookieName(slug));
}

/**
 * Resolve the admin token for a slug, preferring an explicit value (e.g. from
 * an email link's query string) and falling back to the session cookie.
 */
export async function resolveAdminToken(
  slug: string,
  explicit?: string | null
): Promise<string | null> {
  if (explicit) return explicit;
  return getAdminTokenFromCookie(slug);
}

/**
 * Verify that the cookie's admin token matches the party identified by id.
 * Returns the slug if authorized, null otherwise.
 */
export async function authorizeAdminByPartyId(partyId: string): Promise<string | null> {
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { slug: true, adminToken: true },
  });
  if (!party) return null;

  const cookieToken = await getAdminTokenFromCookie(party.slug);
  if (!cookieToken || cookieToken !== party.adminToken) return null;

  return party.slug;
}
