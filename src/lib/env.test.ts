import { describe, it, expect } from "vitest";
import { envSchema, resolveEnv } from "./env";

// These exercise the real schema and resolver. A previous version re-declared
// the schema inside the test, so it could drift from production silently.

const VALID = {
  DATABASE_URL: "postgresql://user:pass@host:5432/db",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test",
};

describe("envSchema", () => {
  it("accepts a minimal environment and defaults NODE_ENV", () => {
    const result = envSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.NODE_ENV).toBe("development");
  });

  it.each([
    ["a missing DATABASE_URL", { BLOB_READ_WRITE_TOKEN: "x" }],
    ["a malformed DATABASE_URL", { ...VALID, DATABASE_URL: "not-a-url" }],
    ["a missing BLOB_READ_WRITE_TOKEN", { DATABASE_URL: VALID.DATABASE_URL }],
    ["an unknown NODE_ENV", { ...VALID, NODE_ENV: "staging" }],
    ["a malformed RESEND_FROM_EMAIL", { ...VALID, RESEND_FROM_EMAIL: "nope" }],
    ["a malformed NEXT_PUBLIC_APP_URL", { ...VALID, NEXT_PUBLIC_APP_URL: "nope" }],
  ])("rejects %s", (_label, raw) => {
    expect(envSchema.safeParse(raw).success).toBe(false);
  });
});

describe("resolveEnv", () => {
  it("keeps an explicit app URL", () => {
    const env = resolveEnv({ ...VALID, NEXT_PUBLIC_APP_URL: "https://voisinons.fr" });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://voisinons.fr");
  });

  it("defaults the app URL outside production", () => {
    expect(resolveEnv(VALID).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  // The regression that broke a deploy: a single localhost default shared by
  // every environment. The production fallback must be the canonical domain,
  // never localhost, and never a hard failure — the variable is optional.
  it("falls back to the canonical domain in production, never localhost", () => {
    const env = resolveEnv({ ...VALID, NODE_ENV: "production" });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://www.voisinons.fr");
  });

  // Preview deployments build with NODE_ENV=production and no project URL set.
  // Falling back to the canonical domain there would make a preview's sitemap,
  // emails and PDF QR codes point at production.
  it("makes a preview deployment reference itself", () => {
    const env = resolveEnv({
      ...VALID,
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "voisinons-fr-git-fix-audit.vercel.app",
    });

    expect(env.NEXT_PUBLIC_APP_URL).toBe(
      "https://voisinons-fr-git-fix-audit.vercel.app"
    );
  });

  it("keeps the canonical domain for the production deployment", () => {
    const env = resolveEnv({
      ...VALID,
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_URL: "voisinons-fr-abc123.vercel.app",
    });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://www.voisinons.fr");
  });

  it("lets an explicit value override every fallback", () => {
    const env = resolveEnv({
      ...VALID,
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://preview.voisinons.fr",
    });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://preview.voisinons.fr");
  });

  // The regression this guards: a missing DATABASE_URL used to be swallowed at
  // runtime, leaving the app pointed at a placeholder database.
  it("throws at runtime when a required variable is missing", () => {
    expect(() => resolveEnv({ NODE_ENV: "production" })).toThrow(
      "Invalid environment variables"
    );
  });

  it("strips a trailing slash so consumers can concatenate safely", () => {
    const env = resolveEnv({ ...VALID, NEXT_PUBLIC_APP_URL: "https://voisinons.fr/" });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://voisinons.fr");
  });

  it("lets the build phase run without the runtime secrets", () => {
    const env = resolveEnv(
      { NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "https://voisinons.fr" },
      { buildPhase: true }
    );

    expect(env.DATABASE_URL).toBe("");
    expect(env.BLOB_READ_WRITE_TOKEN).toBe("");
  });

  it("never yields a localhost URL to a production build", () => {
    const env = resolveEnv({ NODE_ENV: "production" }, { buildPhase: true });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://www.voisinons.fr");
  });
});
