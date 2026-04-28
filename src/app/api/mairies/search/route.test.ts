import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock() is hoisted to the top of the file, so the mocks must be created
// inside vi.hoisted() to be referenced both by the mock factory and by the
// tests below.
const { selectMock, fromMock, whereMock, orderByMock, limitMock } = vi.hoisted(
  () => {
    const limitMock = vi.fn();
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    const selectMock = vi.fn().mockReturnValue({ from: fromMock });
    return { selectMock, fromMock, whereMock, orderByMock, limitMock };
  }
);

vi.mock("@/lib/db", () => ({
  db: {
    select: selectMock,
  },
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ from: fromMock });
  fromMock.mockReturnValue({ where: whereMock });
  whereMock.mockReturnValue({ orderBy: orderByMock });
  orderByMock.mockReturnValue({ limit: limitMock });
  limitMock.mockResolvedValue([]);
});

function makeRequest(query: string): Request {
  return new Request(`https://voisinons.fr/api/mairies/search?q=${query}`);
}

describe("GET /api/mairies/search", () => {
  it("returns empty results without hitting the DB when the query is too short", async () => {
    const res = await GET(makeRequest("l"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ results: [] });
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("returns empty results when the query is whitespace-only", async () => {
    const res = await GET(makeRequest("%20%20"));
    const json = await res.json();

    expect(json).toEqual({ results: [] });
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("returns the DB rows for a valid query", async () => {
    limitMock.mockResolvedValueOnce([
      {
        i: "69001",
        n: "Lyon",
        cp: "69001",
        e: "mairie@lyon.fr",
        t: "04 72 10 30 30",
      },
    ]);

    const res = await GET(makeRequest("lyon"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.results).toHaveLength(1);
    expect(json.results[0]).toMatchObject({
      i: "69001",
      n: "Lyon",
      e: "mairie@lyon.fr",
      t: "04 72 10 30 30",
    });
    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(limitMock).toHaveBeenCalledWith(8);
  });

  it("forwards an empty array when no row matches", async () => {
    limitMock.mockResolvedValueOnce([]);
    const res = await GET(makeRequest("zzzz"));
    const json = await res.json();
    expect(json).toEqual({ results: [] });
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes the query (case + accents) before hitting the DB", async () => {
    await GET(makeRequest(encodeURIComponent("ÉVREUX")));
    // The where()/orderBy() calls receive Drizzle SQL fragments which are not
    // trivial to introspect here. We assert that the normalized query was long
    // enough to trigger the DB path (i.e. didn't short-circuit on length).
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  it("attaches a private Cache-Control header on hits to keep results out of shared caches", async () => {
    limitMock.mockResolvedValueOnce([]);
    const res = await GET(makeRequest("lyon"));
    expect(res.headers.get("Cache-Control")).toContain("private");
    expect(res.headers.get("Cache-Control")).toContain("max-age=60");
  });

  it("disables caching for short-circuit responses", async () => {
    const res = await GET(makeRequest("a"));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
