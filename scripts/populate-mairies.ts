/**
 * Populate the `mairies` table from data.gouv.fr — Licence Ouverte 2.0.
 * Idempotent (UPSERT). Run manually: `npm run db:populate-mairies`.
 */

import { db } from "../src/lib/db";
import { mairies, type NewMairie } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";
import { normalizeForSearch } from "../src/lib/mairies/normalize";
import { extractCommuneAndCp, extractFirstPhone } from "../src/lib/mairies/parse";

const EXPORT_URL =
  "https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/exports/json";
const BATCH_SIZE = 500;

type ApiRecord = {
  nom: string | null;
  adresse_courriel: string | null;
  code_insee_commune: string | null;
  adresse: string | null;
  telephone: string | null;
};

async function fetchAll(): Promise<ApiRecord[]> {
  const url = new URL(EXPORT_URL);
  url.searchParams.set("where", 'pivot like "mairie"');
  url.searchParams.set(
    "select",
    "nom,adresse_courriel,code_insee_commune,adresse,telephone"
  );

  console.log(`Fetching ${url}...`);
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "voisinons.fr build script" },
  });
  if (!res.ok) {
    throw new Error(`API returned ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as ApiRecord[];
}

function buildRows(records: ApiRecord[]): { rows: NewMairie[]; stats: Record<string, number> } {
  const seen = new Set<string>();
  const rows: NewMairie[] = [];
  const stats = { withoutEmail: 0, withoutAddress: 0, dedup: 0 };

  for (const record of records) {
    if (!record.code_insee_commune) continue;
    if (!record.adresse_courriel) {
      stats.withoutEmail++;
      continue;
    }
    const addr = extractCommuneAndCp(record.adresse);
    if (!addr) {
      stats.withoutAddress++;
      continue;
    }
    if (seen.has(record.code_insee_commune)) {
      stats.dedup++;
      continue;
    }
    seen.add(record.code_insee_commune);
    rows.push({
      codeInsee: record.code_insee_commune,
      nom: addr.commune,
      nomNormalise: normalizeForSearch(addr.commune),
      codePostal: addr.cp,
      email: record.adresse_courriel.trim(),
      telephone: extractFirstPhone(record.telephone),
    });
  }

  return { rows, stats };
}

async function upsertBatch(batch: NewMairie[]) {
  await db
    .insert(mairies)
    .values(batch)
    .onConflictDoUpdate({
      target: mairies.codeInsee,
      set: {
        nom: sql`excluded.nom`,
        nomNormalise: sql`excluded.nom_normalise`,
        codePostal: sql`excluded.code_postal`,
        email: sql`excluded.email`,
        telephone: sql`excluded.telephone`,
        updatedAt: sql`now()`,
      },
    });
}

async function main() {
  const records = await fetchAll();
  console.log(`Received ${records.length} records.`);

  const { rows, stats } = buildRows(records);
  console.log(`Prepared ${rows.length} rows for upsert.`);
  console.log(`  Skipped without email:   ${stats.withoutEmail}`);
  console.log(`  Skipped without address: ${stats.withoutAddress}`);
  console.log(`  Skipped duplicate INSEE: ${stats.dedup}`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch);
    if ((i + BATCH_SIZE) % 5000 === 0 || i + BATCH_SIZE >= rows.length) {
      console.log(`  upserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
