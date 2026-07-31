import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vercel/blob", () => ({
  del: vi.fn().mockResolvedValue(undefined),
  list: vi.fn(),
}));

// vi.mock factories are hoisted above the module body, so these have to be too.
const { selectWhere, deleteWhere, findFirst } = vi.hoisted(() => ({
  selectWhere: vi.fn(),
  deleteWhere: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: selectWhere }) }),
    delete: () => ({ where: deleteWhere }),
    query: { parties: { findFirst } },
  },
}));

import { del, list } from "@vercel/blob";
import {
  RETENTION_DAYS,
  deletePartyById,
  purgeExpiredParties,
  purgeOrphanCovers,
} from "./retention";

const NOW = new Date(2026, 6, 31);
const BLOB = "https://store.public.blob.vercel-storage.com/party-cover";

// Only the fields purgeOrphanCovers reads; the real ListBlobResult is wider.
function blobPage(
  blobs: Array<{ url: string; uploadedAt: Date }>,
  hasMore = false,
  cursor?: string
) {
  return { blobs, hasMore, cursor } as unknown as Awaited<ReturnType<typeof list>>;
}

beforeEach(() => {
  selectWhere.mockReset();
  deleteWhere.mockReset().mockResolvedValue(undefined);
  findFirst.mockReset();
  vi.mocked(del).mockClear().mockResolvedValue(undefined);
  vi.mocked(list).mockReset();
});

describe("purgeExpiredParties", () => {
  it("does nothing when no party is past the retention window", async () => {
    selectWhere.mockResolvedValue([]);

    const report = await purgeExpiredParties(NOW);

    expect(report).toEqual({ partiesDeleted: 0, coversDeleted: 0 });
    expect(deleteWhere).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });

  it("deletes expired parties and their cover blobs", async () => {
    selectWhere.mockResolvedValue([
      { id: "p1", coverImageUrl: `${BLOB}/a.jpg` },
      { id: "p2", coverImageUrl: null },
    ]);
    findFirst.mockResolvedValue(undefined);

    const report = await purgeExpiredParties(NOW);

    expect(report).toEqual({ partiesDeleted: 2, coversDeleted: 1 });
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(`${BLOB}/a.jpg`);
  });

  it("keeps a cover still referenced by a live party", async () => {
    selectWhere.mockResolvedValue([{ id: "p1", coverImageUrl: `${BLOB}/shared.jpg` }]);
    findFirst.mockResolvedValue({ id: "still-alive" });

    const report = await purgeExpiredParties(NOW);

    expect(report.partiesDeleted).toBe(1);
    expect(report.coversDeleted).toBe(0);
    expect(del).not.toHaveBeenCalled();
  });

  it("never deletes a URL hosted outside our Blob store", async () => {
    selectWhere.mockResolvedValue([
      { id: "p1", coverImageUrl: "https://utfs.io/f/legacy-key" },
    ]);
    findFirst.mockResolvedValue(undefined);

    const report = await purgeExpiredParties(NOW);

    expect(report.coversDeleted).toBe(0);
    expect(del).not.toHaveBeenCalled();
  });

  it("still reports the deletion when the blob store refuses", async () => {
    selectWhere.mockResolvedValue([{ id: "p1", coverImageUrl: `${BLOB}/a.jpg` }]);
    findFirst.mockResolvedValue(undefined);
    vi.mocked(del).mockRejectedValue(new Error("blob down"));

    const report = await purgeExpiredParties(NOW);

    expect(report).toEqual({ partiesDeleted: 1, coversDeleted: 0 });
  });

  it("uses a cutoff of exactly RETENTION_DAYS before now", async () => {
    selectWhere.mockResolvedValue([]);
    await purgeExpiredParties(NOW);

    expect(RETENTION_DAYS).toBe(30);
    expect(selectWhere).toHaveBeenCalledTimes(1);
  });
});

describe("purgeOrphanCovers", () => {
  const old = new Date(NOW.getTime() - 3 * 24 * 3600 * 1000);
  const fresh = new Date(NOW.getTime() - 60 * 1000);

  it("deletes an old blob no party references", async () => {
    selectWhere.mockResolvedValue([]);
    vi.mocked(list).mockResolvedValue(
      blobPage([{ url: `${BLOB}/orphan.jpg`, uploadedAt: old }])
    );

    expect(await purgeOrphanCovers(NOW)).toBe(1);
    expect(del).toHaveBeenCalledWith(`${BLOB}/orphan.jpg`);
  });

  it("spares a blob uploaded within the grace window (form still open)", async () => {
    selectWhere.mockResolvedValue([]);
    vi.mocked(list).mockResolvedValue(
      blobPage([{ url: `${BLOB}/in-progress.jpg`, uploadedAt: fresh }])
    );

    expect(await purgeOrphanCovers(NOW)).toBe(0);
    expect(del).not.toHaveBeenCalled();
  });

  it("spares a referenced blob", async () => {
    selectWhere.mockResolvedValue([{ url: `${BLOB}/used.jpg` }]);
    vi.mocked(list).mockResolvedValue(
      blobPage([{ url: `${BLOB}/used.jpg`, uploadedAt: old }])
    );

    expect(await purgeOrphanCovers(NOW)).toBe(0);
    expect(del).not.toHaveBeenCalled();
  });

  it("walks every page of the listing", async () => {
    selectWhere.mockResolvedValue([]);
    vi.mocked(list)
      .mockResolvedValueOnce(
        blobPage([{ url: `${BLOB}/page1.jpg`, uploadedAt: old }], true, "c1")
      )
      .mockResolvedValueOnce(
        blobPage([{ url: `${BLOB}/page2.jpg`, uploadedAt: old }])
      );

    expect(await purgeOrphanCovers(NOW)).toBe(2);
    expect(list).toHaveBeenCalledTimes(2);
    expect(vi.mocked(list).mock.calls[1][0]).toMatchObject({ cursor: "c1" });
  });
});

describe("deletePartyById", () => {
  it("refuses a token that does not match", async () => {
    findFirst.mockResolvedValue({
      id: "p1",
      adminToken: "real-token",
      coverImageUrl: null,
    });

    expect(await deletePartyById("p1", "wrong-token")).toBe(false);
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("refuses an unknown party", async () => {
    findFirst.mockResolvedValue(undefined);

    expect(await deletePartyById("nope", "any-token")).toBe(false);
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("deletes the party and its cover on a valid token", async () => {
    findFirst
      .mockResolvedValueOnce({
        id: "p1",
        adminToken: "real-token",
        coverImageUrl: `${BLOB}/cover.jpg`,
      })
      .mockResolvedValueOnce(undefined);

    expect(await deletePartyById("p1", "real-token")).toBe(true);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(`${BLOB}/cover.jpg`);
  });

  it("keeps a cover another party still points at", async () => {
    findFirst
      .mockResolvedValueOnce({
        id: "p1",
        adminToken: "real-token",
        coverImageUrl: `${BLOB}/shared.jpg`,
      })
      .mockResolvedValueOnce({ id: "p2" });

    expect(await deletePartyById("p1", "real-token")).toBe(true);
    expect(del).not.toHaveBeenCalled();
  });
});
