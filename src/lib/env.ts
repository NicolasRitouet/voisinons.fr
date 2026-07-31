import { z } from "zod";

export const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),

  // Optional - emails via Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Optional - shared secret for the Vercel cron that runs the J+30 purge.
  // Absent means the purge endpoint refuses every caller.
  CRON_SECRET: z.string().optional(),

  // Required in production, defaulted in development — see resolveAppUrl.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // System
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema> & { NEXT_PUBLIC_APP_URL: string };

const DEV_APP_URL = "http://localhost:3000";

// `next build` imports every module to collect routes and metadata, sometimes
// without the runtime secrets. That phase — and only that phase — may skip
// validation. At request time a missing variable has to crash loudly instead
// of silently falling through to a placeholder database.
const BUILD_PLACEHOLDER: Env = {
  DATABASE_URL: "",
  BLOB_READ_WRITE_TOKEN: "",
  NEXT_PUBLIC_APP_URL: DEV_APP_URL,
  NODE_ENV: "production",
};

function resolveAppUrl(parsed: z.infer<typeof envSchema>): string {
  if (parsed.NEXT_PUBLIC_APP_URL) return parsed.NEXT_PUBLIC_APP_URL;
  if (parsed.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required in production: it builds the links in emails, PDFs and QR codes."
    );
  }
  return DEV_APP_URL;
}

export function resolveEnv(
  raw: Record<string, string | undefined>,
  { buildPhase = false }: { buildPhase?: boolean } = {}
): Env {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    if (buildPhase) return BUILD_PLACEHOLDER;
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  if (buildPhase && !parsed.data.NEXT_PUBLIC_APP_URL) {
    return { ...parsed.data, NEXT_PUBLIC_APP_URL: DEV_APP_URL };
  }

  return { ...parsed.data, NEXT_PUBLIC_APP_URL: resolveAppUrl(parsed.data) };
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = resolveEnv(process.env, {
      buildPhase: process.env.NEXT_PHASE === "phase-production-build",
    });
  }
  return cachedEnv;
}

export const env = getEnv();
