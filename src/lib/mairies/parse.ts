/**
 * Pure parsers for the JSON-encoded fields returned by the Annuaire de
 * l'administration API. These are extracted from populate-mairies.ts so they
 * can be unit-tested without hitting the network.
 */

type ApiAddress = {
  code_postal?: string;
  nom_commune?: string;
};

type ApiPhone = {
  valeur?: string;
};

/**
 * Parse the `adresse` field (JSON string of ApiAddress[]) and return the first
 * usable commune + code postal pair. Returns null if the field is missing,
 * malformed, or doesn't carry both fields.
 */
export function extractCommuneAndCp(
  raw: string | null
): { commune: string; cp: string } | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const first = parsed[0] as ApiAddress;
  if (!first?.nom_commune || !first?.code_postal) return null;
  return { commune: first.nom_commune.trim(), cp: first.code_postal.trim() };
}

/**
 * Parse the `telephone` field (JSON string of ApiPhone[]) and return the first
 * non-empty phone number. Returns null if the field is missing or carries no
 * usable value.
 */
export function extractFirstPhone(raw: string | null): string | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const first = (parsed as ApiPhone[]).find((p) => p?.valeur && p.valeur.trim());
  return first?.valeur?.trim() ?? null;
}
