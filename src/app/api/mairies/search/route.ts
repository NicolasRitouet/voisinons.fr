import { NextResponse } from "next/server";
import { ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mairies } from "@/lib/db/schema";
import { normalizeForSearch } from "@/lib/mairies/normalize";

export const runtime = "nodejs";

const MAX_RESULTS = 8;
const MIN_QUERY_LENGTH = 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = normalizeForSearch(searchParams.get("q") ?? "");

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { results: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const prefixPattern = `${q}%`;
  const containsPattern = `%${q}%`;

  const rows = await db
    .select({
      i: mairies.codeInsee,
      n: mairies.nom,
      cp: mairies.codePostal,
      e: mairies.email,
      t: mairies.telephone,
    })
    .from(mairies)
    .where(ilike(mairies.nomNormalise, containsPattern))
    .orderBy(
      sql`CASE WHEN ${mairies.nomNormalise} LIKE ${prefixPattern} THEN 0 ELSE 1 END`,
      sql`length(${mairies.nom})`,
      mairies.nom
    )
    .limit(MAX_RESULTS);

  return NextResponse.json(
    { results: rows },
    {
      headers: {
        // Per-user query, no value caching at the CDN edge.
        "Cache-Control": "private, max-age=60",
      },
    }
  );
}
