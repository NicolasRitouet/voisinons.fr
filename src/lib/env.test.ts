import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the env schema logic without importing the actual module
// (which would try to validate real env vars)

describe("env schema validation", () => {
  const envSchema = z.object({
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    UPLOADTHING_TOKEN: z.string().min(1, "UPLOADTHING_TOKEN is required"),
    BLOB_READ_WRITE_TOKEN: z
      .string()
      .min(1, "BLOB_READ_WRITE_TOKEN is required"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  });

  it("should accept valid production environment", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      RESEND_API_KEY: "re_123456",
      UPLOADTHING_TOKEN: "ut_test",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
      NODE_ENV: "production",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(true);
  });

  it("should accept minimal valid environment", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      UPLOADTHING_TOKEN: "ut_test",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    }
  });

  it("should reject invalid DATABASE_URL", () => {
    const env = {
      DATABASE_URL: "not-a-url",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should reject missing DATABASE_URL", () => {
    const env = {};

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should reject missing UPLOADTHING_TOKEN", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should reject missing BLOB_READ_WRITE_TOKEN", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      UPLOADTHING_TOKEN: "ut_test",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should reject invalid NODE_ENV", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      UPLOADTHING_TOKEN: "ut_test",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
      NODE_ENV: "staging",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should reject invalid RESEND_FROM_EMAIL format", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      RESEND_FROM_EMAIL: "not-an-email",
      UPLOADTHING_TOKEN: "ut_test",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(false);
  });

  it("should accept valid NEXT_PUBLIC_APP_URL", () => {
    const env = {
      DATABASE_URL: "postgresql://user:pass@host:5432/db",
      NEXT_PUBLIC_APP_URL: "https://voisinons.fr",
      UPLOADTHING_TOKEN: "ut_test",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
    };

    const result = envSchema.safeParse(env);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_APP_URL).toBe("https://voisinons.fr");
    }
  });
});
