import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

// During build time, DATABASE_URL might be empty
// We create a dummy connection that will fail at runtime if used
const client = env.DATABASE_URL
  ? postgres(env.DATABASE_URL)
  : postgres("postgresql://dummy:dummy@localhost:5432/dummy");

export const db = drizzle(client, { schema });
