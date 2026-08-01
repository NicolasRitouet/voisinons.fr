// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const { findFirst } = vi.hoisted(() => ({ findFirst: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { query: { parties: { findFirst } } },
}));

import { isAdminToken, requireAdmin } from "./require-admin";

const TOKEN = "a".repeat(64);

beforeEach(() => {
  findFirst.mockReset();
});

describe("isAdminToken", () => {
  it("accepts an exact match", () => {
    expect(isAdminToken(TOKEN, TOKEN)).toBe(true);
  });

  it.each([
    ["a different token", TOKEN, "b".repeat(64)],
    ["a prefix", TOKEN, "a".repeat(63)],
    ["a longer token", TOKEN, "a".repeat(65)],
    ["an empty string", TOKEN, ""],
    ["a null candidate", TOKEN, null],
    ["a null expectation", null, TOKEN],
    ["two nulls", null, null],
  ])("rejects %s", (_label, expected, provided) => {
    expect(isAdminToken(expected, provided)).toBe(false);
  });
});

describe("requireAdmin", () => {
  it("resolves the party when the token matches", async () => {
    findFirst.mockResolvedValue({ id: "p1", adminToken: TOKEN });

    await expect(requireAdmin({ partyId: "p1" }, TOKEN)).resolves.toMatchObject({
      id: "p1",
    });
  });

  it("accepts a slug reference too", async () => {
    findFirst.mockResolvedValue({ slug: "rue-x", adminToken: TOKEN });

    await expect(requireAdmin({ slug: "rue-x" }, TOKEN)).resolves.not.toBeNull();
  });

  it("refuses a wrong token", async () => {
    findFirst.mockResolvedValue({ id: "p1", adminToken: TOKEN });

    await expect(requireAdmin({ partyId: "p1" }, "b".repeat(64))).resolves.toBeNull();
  });

  it("refuses an unknown party", async () => {
    findFirst.mockResolvedValue(undefined);

    await expect(requireAdmin({ partyId: "nope" }, TOKEN)).resolves.toBeNull();
  });

  it.each([null, undefined, ""])(
    "short-circuits on a %j token without querying the database",
    async (token) => {
      await expect(requireAdmin({ partyId: "p1" }, token)).resolves.toBeNull();
      expect(findFirst).not.toHaveBeenCalled();
    }
  );
});

// The regression this helper exists to prevent: a new admin action that
// re-implements the check by hand, and gets it subtly wrong.
describe("no hand-rolled admin token comparison survives", () => {
  const SRC = join(process.cwd(), "src");
  const COMPARISON = /adminToken\s*(!==|===|==|!=)|(!==|===|==|!=)\s*[\w.?]*adminToken/;

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
      return [path];
    });
  }

  it("compares admin tokens only inside require-admin.ts", () => {
    const offenders = sourceFiles(SRC)
      .filter((path) => !path.endsWith("require-admin.ts"))
      .filter((path) =>
        readFileSync(path, "utf8")
          .split("\n")
          .some((line) => COMPARISON.test(line))
      )
      .map((path) => path.replace(`${process.cwd()}/`, ""));

    expect(offenders).toEqual([]);
  });
});
