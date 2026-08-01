import { describe, it, expect, vi, afterEach } from "vitest";
import { addDays, startOfDay } from "date-fns";
import { getDefaultPartyDate, lastFridayOfMay } from "./fete-des-voisins";
import { createPartySchema } from "./validations/party";

describe("lastFridayOfMay", () => {
  it.each([
    [2025, new Date(2025, 4, 30)],
    [2026, new Date(2026, 4, 29)],
    [2027, new Date(2027, 4, 28)],
    [2028, new Date(2028, 4, 26)],
  ])("resolves %i to its last Friday of May", (year, expected) => {
    expect(lastFridayOfMay(year)).toEqual(expected);
  });
});

describe("getDefaultPartyDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("proposes the coming edition during the season", () => {
    expect(getDefaultPartyDate(new Date(2026, 3, 1))).toEqual(new Date(2026, 4, 29));
  });

  it("falls back to a near date once the edition has passed", () => {
    expect(getDefaultPartyDate(new Date(2026, 6, 31))).toEqual(new Date(2026, 7, 7));
  });

  // The regression that shipped: a literal default that createPartySchema
  // started rejecting the day it went past. Walk a full seasonal cycle.
  it("always yields a date the create schema accepts", () => {
    vi.useFakeTimers({ toFake: ["Date"] });

    for (let offset = 0; offset < 400; offset++) {
      const now = addDays(new Date(2026, 0, 1), offset);
      vi.setSystemTime(now);

      const proposed = getDefaultPartyDate();
      expect(
        proposed.getTime(),
        `default ${proposed.toISOString()} is in the past on ${now.toISOString()}`
      ).toBeGreaterThanOrEqual(startOfDay(now).getTime());

      const parsed = createPartySchema.safeParse({
        name: "Fête de la rue",
        slug: "fete-rue",
        placeType: "rue",
        address: "12 rue de la Paix, 75001 Paris",
        date: proposed.toISOString(),
        timeStart: "14:00",
        organizerName: "Jean Dupont",
        organizerEmail: "jean@example.com",
      });
      expect(parsed.success, `rejected on ${now.toISOString()}`).toBe(true);
    }
  });
});
