import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

// Beyond this horizon the next edition is too far away to be a useful default:
// off-season visitors are organising an apéro next week, not next May.
const SEASONAL_HORIZON_DAYS = 150;
const OFF_SEASON_LEAD_DAYS = 7;

/** La Fête des Voisins tombe le dernier vendredi de mai. */
export function lastFridayOfMay(year: number): Date {
  const endOfMay = new Date(year, 4, 31);
  const daysSinceFriday = (endOfMay.getDay() - 5 + 7) % 7;
  return startOfDay(addDays(endOfMay, -daysSinceFriday));
}

/**
 * Default date for the create-party form. Must never be in the past: the
 * form ships it straight into createPartySchema, which rejects past dates.
 */
export function getDefaultPartyDate(now: Date = new Date()): Date {
  const today = startOfDay(now);

  let edition = lastFridayOfMay(today.getFullYear());
  if (edition < today) {
    edition = lastFridayOfMay(today.getFullYear() + 1);
  }

  return differenceInCalendarDays(edition, today) <= SEASONAL_HORIZON_DAYS
    ? edition
    : addDays(today, OFF_SEASON_LEAD_DAYS);
}
