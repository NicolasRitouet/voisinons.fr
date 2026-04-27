import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  try {
    await db.execute(sql`SELECT 1`);
  } catch (error) {
    // Log the real cause server-side; never expose driver/host details to
    // unauthenticated callers (this endpoint is publicly scrappable).
    console.error("[health] DB ping failed:", error);
    return NextResponse.json(
      { status: "error", db: "down", latencyMs: Date.now() - startedAt },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { status: "ok", db: "ok", latencyMs: Date.now() - startedAt },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
