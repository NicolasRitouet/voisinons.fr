import { differenceInDays } from "date-fns";

export interface ReminderBucket {
  name: "J-14" | "J-7" | "J-3";
  minDays: number;
  maxDays: number;
  cooldownDays: number;
}

/**
 * Adaptive reminder windows, evaluated once a day.
 *
 * Each cooldown is at least as long as its own window, so a party can only be
 * mailed once per bucket — three reminders over its whole life, never four.
 * `remindersForLifecycle` in the tests walks a party day by day and pins that
 * down; change a number here and it will tell you.
 */
export const REMINDER_BUCKETS: readonly ReminderBucket[] = [
  { name: "J-14", minDays: 12, maxDays: 15, cooldownDays: 5 },
  { name: "J-7", minDays: 5, maxDays: 8, cooldownDays: 5 },
  { name: "J-3", minDays: 2, maxDays: 4, cooldownDays: 3 },
];

export const REMINDER_WINDOW_MIN_DAYS = 2;
export const REMINDER_WINDOW_MAX_DAYS = 15;

/** Above this headcount the organizer no longer needs nudging. */
export const UNDERBOOKED_MAX_PARTICIPANTS = 2;

export interface ReminderCandidate {
  slug: string;
  dateStart: Date;
  lastReminderAt: Date | null;
  participantCount: number;
  reminderOptOut: boolean;
}

export type SkipReason =
  | "opted-out"
  | "outside-bucket"
  | "already-engaged"
  | "cooldown";

export interface ReminderDecision<T extends ReminderCandidate> {
  due: Array<{ party: T; bucket: ReminderBucket; daysUntilParty: number }>;
  skipped: Array<{ slug: string; reason: SkipReason; detail?: string }>;
}

export function bucketFor(daysUntilParty: number): ReminderBucket | undefined {
  return REMINDER_BUCKETS.find(
    (bucket) =>
      daysUntilParty >= bucket.minDays && daysUntilParty <= bucket.maxDays
  );
}

/**
 * Pure decision pass: given today's candidates, who gets a reminder.
 * Kept free of I/O so the whole policy is testable without a database.
 */
export function selectReminders<T extends ReminderCandidate>(
  candidates: readonly T[],
  now: Date
): ReminderDecision<T> {
  const due: ReminderDecision<T>["due"] = [];
  const skipped: ReminderDecision<T>["skipped"] = [];

  for (const party of candidates) {
    if (party.reminderOptOut) {
      skipped.push({ slug: party.slug, reason: "opted-out" });
      continue;
    }

    const daysUntilParty = differenceInDays(party.dateStart, now);
    const bucket = bucketFor(daysUntilParty);

    if (!bucket) {
      skipped.push({
        slug: party.slug,
        reason: "outside-bucket",
        detail: `J-${daysUntilParty}`,
      });
      continue;
    }

    if (party.participantCount > UNDERBOOKED_MAX_PARTICIPANTS) {
      skipped.push({ slug: party.slug, reason: "already-engaged" });
      continue;
    }

    if (party.lastReminderAt) {
      const daysSince = differenceInDays(now, party.lastReminderAt);
      if (daysSince < bucket.cooldownDays) {
        skipped.push({
          slug: party.slug,
          reason: "cooldown",
          detail: `${bucket.cooldownDays}d, last sent ${daysSince}d ago`,
        });
        continue;
      }
    }

    due.push({ party, bucket, daysUntilParty });
  }

  return { due, skipped };
}
