import { describe, it, expect } from "vitest";
import { addDays } from "date-fns";
import {
  REMINDER_BUCKETS,
  REMINDER_WINDOW_MAX_DAYS,
  REMINDER_WINDOW_MIN_DAYS,
  bucketFor,
  selectReminders,
  type ReminderCandidate,
} from "./reminders";

const NOW = new Date(2026, 3, 1, 9, 0, 0);

function candidate(overrides: Partial<ReminderCandidate> = {}): ReminderCandidate {
  return {
    slug: "rue-jaboulay-lyon",
    dateStart: addDays(NOW, 14),
    lastReminderAt: null,
    participantCount: 1,
    reminderOptOut: false,
    ...overrides,
  };
}

describe("bucketFor", () => {
  it.each([
    [15, "J-14"],
    [12, "J-14"],
    [8, "J-7"],
    [5, "J-7"],
    [4, "J-3"],
    [2, "J-3"],
  ])("maps J-%i to %s", (days, expected) => {
    expect(bucketFor(days)?.name).toBe(expected);
  });

  it.each([1, 9, 10, 11, 16, 30])("leaves J-%i unbucketed", (days) => {
    expect(bucketFor(days)).toBeUndefined();
  });

  it("keeps every bucket inside the SQL pre-filter window", () => {
    for (const bucket of REMINDER_BUCKETS) {
      expect(bucket.minDays).toBeGreaterThanOrEqual(REMINDER_WINDOW_MIN_DAYS);
      expect(bucket.maxDays).toBeLessThanOrEqual(REMINDER_WINDOW_MAX_DAYS);
    }
  });
});

describe("selectReminders", () => {
  it("sends to an underbooked party inside a bucket", () => {
    const { due } = selectReminders([candidate()], NOW);

    expect(due).toHaveLength(1);
    expect(due[0].bucket.name).toBe("J-14");
    expect(due[0].daysUntilParty).toBe(14);
  });

  it.each([
    ["an opted-out organizer", { reminderOptOut: true }, "opted-out"],
    ["a party outside every bucket", { dateStart: addDays(NOW, 10) }, "outside-bucket"],
    ["an already-engaged party", { participantCount: 3 }, "already-engaged"],
    ["a party still in cooldown", { lastReminderAt: addDays(NOW, -1) }, "cooldown"],
  ] as const)("skips %s", (_label, overrides, reason) => {
    const { due, skipped } = selectReminders([candidate(overrides)], NOW);

    expect(due).toHaveLength(0);
    expect(skipped[0].reason).toBe(reason);
  });

  it("still nudges a party sitting at exactly the engagement threshold", () => {
    const { due } = selectReminders([candidate({ participantCount: 2 })], NOW);

    expect(due).toHaveLength(1);
  });

  // With 24h-period math the same party drifted between buckets depending on
  // what time the cron happened to fire relative to the party's start time.
  it("puts a party in the same bucket whatever time the cron runs", () => {
    const partyDate = new Date(2026, 3, 15, 19, 0, 0);
    const buckets = [0, 6, 8, 12, 18, 23].map((hour) => {
      const runAt = new Date(2026, 3, 1, hour, 0, 0);
      const { due } = selectReminders(
        [candidate({ dateStart: partyDate })],
        runAt
      );
      return due[0]?.bucket.name ?? null;
    });

    expect(new Set(buckets).size).toBe(1);
    expect(buckets[0]).toBe("J-14");
  });

  it("treats the cooldown boundary as elapsed", () => {
    const justInside = selectReminders(
      [candidate({ lastReminderAt: addDays(NOW, -4) })],
      NOW
    );
    const justOutside = selectReminders(
      [candidate({ lastReminderAt: addDays(NOW, -5) })],
      NOW
    );

    expect(justInside.due).toHaveLength(0);
    expect(justOutside.due).toHaveLength(1);
  });
});

/**
 * Walks one party day by day from its creation to its date, running the daily
 * cron each morning. The PR advertised "up to 3 reminders"; the original
 * cooldowns allowed a fourth (J-4 then J-2, two days apart).
 */
function remindersForLifecycle(startOffsetDays: number): string[] {
  const partyDate = addDays(NOW, startOffsetDays);
  let lastReminderAt: Date | null = null;
  const buckets: string[] = [];

  for (let day = 0; day <= startOffsetDays; day++) {
    const today = addDays(NOW, day);
    const { due } = selectReminders(
      [candidate({ dateStart: partyDate, lastReminderAt })],
      today
    );
    if (due.length > 0) {
      buckets.push(due[0].bucket.name);
      lastReminderAt = today;
    }
  }

  return buckets;
}

describe("reminder lifecycle", () => {
  it.each([30, 20, 15, 14, 12, 10, 8, 5, 4, 2])(
    "never sends more than one reminder per bucket for a party created J-%i",
    (offset) => {
      const buckets = remindersForLifecycle(offset);

      expect(buckets.length).toBeLessThanOrEqual(3);
      expect(new Set(buckets).size).toBe(buckets.length);
    }
  );

  it("walks a long-lived party through all three buckets in order", () => {
    expect(remindersForLifecycle(30)).toEqual(["J-14", "J-7", "J-3"]);
  });

  it("sends nothing to a party created inside the last 48 hours", () => {
    expect(remindersForLifecycle(1)).toEqual([]);
  });
});
