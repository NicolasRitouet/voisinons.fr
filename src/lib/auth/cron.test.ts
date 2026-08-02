// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const envMock = vi.hoisted(() => ({}) as { CRON_SECRET?: string });
vi.mock("@/lib/env", () => ({ env: envMock }));

import { isCronRequestAuthorized } from "./cron";

const SECRET = "cron-secret-value";

beforeEach(() => {
  envMock.CRON_SECRET = SECRET;
});

describe("isCronRequestAuthorized", () => {
  it("accepts the header Vercel Cron sends", () => {
    expect(isCronRequestAuthorized(`Bearer ${SECRET}`)).toBe(true);
  });

  it.each([
    ["a null header", null],
    ["an empty header", ""],
    ["a wrong secret", "Bearer nope"],
    ["a missing Bearer scheme", SECRET],
    ["a lowercase scheme", `bearer ${SECRET}`],
    ["a prefix of the secret", `Bearer ${SECRET.slice(0, -1)}`],
    ["trailing padding", `Bearer ${SECRET} `],
  ])("refuses %s", (_label, header) => {
    expect(isCronRequestAuthorized(header)).toBe(false);
  });

  // An unset secret must not turn the endpoint into an open door, and must not
  // be distinguishable from a wrong one by the caller.
  it("refuses everything when CRON_SECRET is unset", () => {
    delete envMock.CRON_SECRET;

    expect(isCronRequestAuthorized(`Bearer ${SECRET}`)).toBe(false);
    expect(isCronRequestAuthorized("Bearer undefined")).toBe(false);
    expect(isCronRequestAuthorized(null)).toBe(false);
  });
});
