// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock factories are hoisted above the module body, so this has to be too.
const envMock = vi.hoisted(() => ({}) as { CRON_SECRET?: string });
vi.mock("@/lib/env", () => ({ env: envMock }));

vi.mock("@/lib/retention", () => ({
  runRetentionPurge: vi.fn(),
}));

import { NextRequest } from "next/server";
import { runRetentionPurge } from "@/lib/retention";
import { GET } from "./route";

const SECRET = "cron-secret-value";

function request(authorization?: string) {
  return new NextRequest("http://localhost/api/cron/purge", {
    headers: authorization ? { authorization } : {},
  });
}

beforeEach(() => {
  envMock.CRON_SECRET = SECRET;
  vi.mocked(runRetentionPurge).mockReset().mockResolvedValue({
    partiesDeleted: 3,
    coversDeleted: 1,
    orphanCoversDeleted: 2,
  });
});

describe("GET /api/cron/purge", () => {
  it("runs the purge for Vercel's authenticated cron call", async () => {
    const response = await GET(request(`Bearer ${SECRET}`));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      partiesDeleted: 3,
      coversDeleted: 1,
      orphanCoversDeleted: 2,
    });
  });

  it.each([
    ["no header", undefined],
    ["a wrong secret", "Bearer nope"],
    ["the raw secret without the Bearer scheme", SECRET],
    ["an empty bearer", "Bearer "],
  ])("refuses %s", async (_label, header) => {
    const response = await GET(request(header));

    expect(response.status).toBe(401);
    expect(runRetentionPurge).not.toHaveBeenCalled();
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    delete envMock.CRON_SECRET;

    const response = await GET(request("Bearer undefined"));

    expect(response.status).toBe(401);
    expect(runRetentionPurge).not.toHaveBeenCalled();
  });

  it("reports a failure without leaking the cause", async () => {
    vi.mocked(runRetentionPurge).mockRejectedValue(
      new Error("connection to db-prod-1.internal refused")
    );

    const response = await GET(request(`Bearer ${SECRET}`));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: "error" });
  });
});
