/**
 * Normalize a string for accent-insensitive, case-insensitive search.
 *
 * Used in two places that MUST stay in sync:
 *   - populate-mairies.ts (writes nom_normalise into the DB)
 *   - api/mairies/search/route.ts (normalizes the user query)
 *
 * Any change here must be followed by a re-run of `db:populate-mairies`
 * so existing rows match the new normalization.
 */
export function normalizeForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
