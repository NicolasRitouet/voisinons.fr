import { z } from "zod";

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Optional - emails via Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Optional - app URL (has default)
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z
    .string()
    .min(1, "BLOB_READ_WRITE_TOKEN is required"),

  // System
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// For build-time safety, check if we're in a build context
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export const env = isBuildTime
  ? ({ DATABASE_URL: "", NODE_ENV: "production" } as Env)
  : getEnv();
