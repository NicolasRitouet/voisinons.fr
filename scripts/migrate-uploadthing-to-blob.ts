import { put } from "@vercel/blob";
import { fileTypeFromBuffer } from "file-type";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { parties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

interface Row {
  id: string;
  cover_image_url: string;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const databaseUrl = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN is required");

  console.log(`Mode: ${apply ? "APPLY (writes)" : "DRY-RUN (read-only)"}`);

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  const rows = (await db.execute(sql`
    SELECT id::text AS id, cover_image_url
    FROM parties
    WHERE cover_image_url LIKE '%utfs.io%'
       OR cover_image_url LIKE '%ufs.sh%'
       OR cover_image_url LIKE '%uploadthing%'
  `)) as unknown as Row[];

  console.log(`Found ${rows.length} party rows to migrate.`);

  let migrated = 0;
  let skipped = 0;
  const failures: Array<{ id: string; reason: string }> = [];

  for (const row of rows) {
    const oldUrl = row.cover_image_url;
    process.stdout.write(`- ${row.id}  ${oldUrl}\n`);

    try {
      const res = await fetch(oldUrl);
      if (!res.ok) {
        failures.push({ id: row.id, reason: `fetch ${res.status}` });
        continue;
      }
      const buffer = new Uint8Array(await res.arrayBuffer());
      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !MIME_TO_EXT[detected.mime]) {
        failures.push({
          id: row.id,
          reason: `unsupported type: ${detected?.mime ?? "unknown"}`,
        });
        continue;
      }

      const ext = MIME_TO_EXT[detected.mime];
      const pathname = `party-cover/${crypto.randomUUID()}.${ext}`;

      if (apply) {
        const blob = await put(pathname, Buffer.from(buffer), {
          access: "public",
          addRandomSuffix: false,
          contentType: detected.mime,
          token: blobToken,
        });

        await db
          .update(parties)
          .set({ coverImageUrl: blob.url })
          .where(eq(parties.id, row.id));

        process.stdout.write(`  -> ${blob.url}\n`);
        migrated++;
      } else {
        process.stdout.write(
          `  -> would upload to ${pathname} (${detected.mime}, ${buffer.byteLength} bytes)\n`
        );
        skipped++;
      }
    } catch (err) {
      failures.push({
        id: row.id,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await client.end();

  console.log("");
  console.log(`Done. migrated=${migrated} skipped(dry)=${skipped} failed=${failures.length}`);
  if (failures.length > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(`  - ${f.id}: ${f.reason}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
