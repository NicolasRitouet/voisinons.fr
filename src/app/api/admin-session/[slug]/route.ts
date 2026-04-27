import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/auth/admin-session";

export const runtime = "nodejs";

/**
 * Manages the httpOnly admin session cookie. Centralized here because cookie
 * mutation isn't allowed from Server Components.
 *
 * - GET ?token=…  : validate token vs DB, set cookie, redirect to /[slug]/admin
 * - GET ?clear=1  : delete cookie, redirect to /[slug] (used to clean orphans)
 * - POST { token }: same as GET ?token=… but for client-side flows that hold
 *                   the token in localStorage and prefer not to leak it via URL.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get("token");
  const clear = request.nextUrl.searchParams.get("clear");

  if (clear === "1") {
    await clearAdminSessionCookie(slug);
    return NextResponse.redirect(new URL(`/${slug}`, request.url), {
      status: 303,
    });
  }

  if (!token) {
    return NextResponse.redirect(new URL(`/${slug}`, request.url), {
      status: 303,
    });
  }

  const party = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    columns: { adminToken: true },
  });

  if (!party || party.adminToken !== token) {
    return NextResponse.redirect(new URL(`/${slug}`, request.url), {
      status: 303,
    });
  }

  await setAdminSessionCookie(slug, token);
  return NextResponse.redirect(new URL(`/${slug}/admin`, request.url), {
    status: 303,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const party = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    columns: { adminToken: true },
  });

  if (!party || party.adminToken !== token) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  await setAdminSessionCookie(slug, token);

  return NextResponse.redirect(new URL(`/${slug}/admin`, request.url), {
    status: 303,
  });
}
