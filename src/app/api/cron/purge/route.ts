import { NextRequest, NextResponse } from "next/server";
import { runRetentionPurge } from "@/lib/retention";
import { isCronRequestAuthorized } from "@/lib/auth/cron";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request.headers.get("authorization"))) {
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
