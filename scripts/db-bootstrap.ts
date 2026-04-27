/**
 * STRICT one-shot script to adopt Drizzle migrations on a database whose
 * schema was created via `drizzle-kit push` (no migration history).
 *
 * Run exactly ONCE per environment, immediately after generating the baseline
 * migration. The script aborts if `drizzle.__drizzle_migrations` already
 * contains any row — re-running it on top of an existing ledger would corrupt
 * it (duplicate hashes, stale `created_at` ordering). Use `db:migrate` for
 * everything after the first bootstrap.
 *
 * Usage: keyway run -e production -- tsx scripts/db-bootstrap.ts
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
const JOURNAL_PATH = path.join(MIGRATIONS_DIR, "meta", "_journal.json");

type JournalEntry = {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
};

type Journal = {
  version: string;
  dialect: string;
  entries: JournalEntry[];
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!fs.existsSync(JOURNAL_PATH)) {
    throw new Error(`Migration journal not found: ${JOURNAL_PATH}`);
  }

  const journal: Journal = JSON.parse(fs.readFileSync(JOURNAL_PATH, "utf-8"));

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
    await sql`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;

    const [existingCount] = await sql<{ count: string }[]>`
      SELECT count(*)::text AS count FROM drizzle.__drizzle_migrations
    `;

    if (existingCount && Number(existingCount.count) > 0) {
      console.error(
        `Refusing to bootstrap: drizzle.__drizzle_migrations already contains ${existingCount.count} row(s).`
      );
      console.error(
        "This script is one-shot. Use 'npm run db:migrate' / 'db:migrate:prod' for further changes."
      );
      process.exit(2);
    }

    let inserted = 0;
    for (const entry of journal.entries) {
      const filePath = path.join(MIGRATIONS_DIR, `${entry.tag}.sql`);
      const content = fs.readFileSync(filePath, "utf-8");
      const hash = crypto.createHash("sha256").update(content).digest("hex");

      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when})
      `;
      console.log(`Marked ${entry.tag} as applied (hash: ${hash.slice(0, 12)}…)`);
      inserted++;
    }

    console.log(`Done. ${inserted} migration(s) marked as applied.`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
