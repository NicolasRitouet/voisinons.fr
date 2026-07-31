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

  // Silently defaulting here would send localhost links in production emails,
  // PDF QR codes and the sitemap.
  it("refuses to guess the app URL in production", () => {
    expect(() => resolveEnv({ ...VALID, NODE_ENV: "production" })).toThrow(
      /NEXT_PUBLIC_APP_URL is required in production/
    );
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

  // NEXT_PUBLIC_APP_URL is baked into the sitemap, robots.txt and metadata at
  // build time. Defaulting it here would ship localhost links to production
  // with no runtime check left to catch them.
  it("still demands the app URL during a production build", () => {
    expect(() =>
      resolveEnv({ NODE_ENV: "production" }, { buildPhase: true })
    ).toThrow(/NEXT_PUBLIC_APP_URL is required in production/);
  });
});
