import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runRetentionPurge } from "@/lib/retention";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function matchesCronSecret(header: string | null): boolean {
  const secret = env.CRON_SECRET;
  // Fail closed: an unset secret must never mean "open to everyone".
  if (!secret || !header) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(header);
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

export async function GET(request: NextRequest) {
  if (!matchesCronSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const report = await runRetentionPurge();
    console.info("[retention] purge complete:", report);

    return NextResponse.json(
      { status: "ok", ...report },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[retention] purge failed:", error);
    return NextResponse.json(
      { status: "error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
