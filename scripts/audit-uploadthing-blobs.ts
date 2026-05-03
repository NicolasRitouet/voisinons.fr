import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  const result = await db.execute(sql`
    SELECT
      count(*) FILTER (WHERE cover_image_url IS NOT NULL) AS total_with_cover,
      count(*) FILTER (
        WHERE cover_image_url LIKE '%utfs.io%'
           OR cover_image_url LIKE '%ufs.sh%'
           OR cover_image_url LIKE '%uploadthing%'
      ) AS uploadthing_urls,
      count(*) FILTER (WHERE cover_image_url LIKE '%public.blob.vercel-storage.com%') AS vercel_blob_urls,
      count(*) AS total_parties
    FROM parties
  `);

  console.log(JSON.stringify(result[0], null, 2));

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
