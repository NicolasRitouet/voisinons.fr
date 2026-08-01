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

  // Injected by Vercel. VERCEL_URL is the deployment-specific hostname, which
  // lets a preview reference itself instead of production.
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_URL: z.string().optional(),

  // System
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema> & { NEXT_PUBLIC_APP_URL: string };

const DEV_APP_URL = "http://localhost:3000";
// Canonical production domain. Before this file owned the value, site.ts
// already fell back to it, which is why production never needed the variable
// set — only the two files disagreeing made it look required.
const PROD_APP_URL = "https://www.voisinons.fr";

// `next build` imports every module to collect routes and metadata, and can run
// without the runtime secrets. NEXT_PUBLIC_APP_URL is not one of them: it is a
// build-time public variable, baked into the sitemap, robots.txt and every
// metadata URL, so its fallback is environment-dependent rather than a single
// localhost default that would silently ship to production.
const buildPhaseSchema = envSchema.extend({
  DATABASE_URL: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
  BLOB_READ_WRITE_TOKEN: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
});

function resolveAppUrl(parsed: z.infer<typeof envSchema>): string {
  // url() accepts a trailing slash and consumers concatenate `${SITE_URL}/...`,
  // so normalise here instead of in every caller.
  if (parsed.NEXT_PUBLIC_APP_URL) {
    return parsed.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  // Preview deployments build with NODE_ENV=production but have no project
  // URL configured; pointing them at the canonical domain would make their
  // sitemap, emails and QR codes reference production instead of themselves.
  if (parsed.VERCEL_ENV === "preview" && parsed.VERCEL_URL) {
    return `https://${parsed.VERCEL_URL}`;
  }

  return parsed.NODE_ENV === "production" ? PROD_APP_URL : DEV_APP_URL;
}

export function resolveEnv(
  raw: Record<string, string | undefined>,
  { buildPhase = false }: { buildPhase?: boolean } = {}
): Env {
  const parsed = (buildPhase ? buildPhaseSchema : envSchema).safeParse(raw);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
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
