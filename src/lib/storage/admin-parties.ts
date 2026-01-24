const VERSION = "v1";
const STORAGE_KEY = `voisinons_admin_parties:${VERSION}`;
const LEGACY_KEY = "voisinons_admin_parties";

type AdminParty = {
  slug: string;
  adminToken: string;
};

// In-memory cache to avoid repeated localStorage reads
let cachedParties: AdminParty[] | null = null;

function migrateFromLegacy(): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parties = JSON.parse(legacy) as AdminParty[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // Migration failed, ignore
  }
}

function getStoredParties(): AdminParty[] {
  if (cachedParties !== null) return cachedParties;

  if (typeof window === "undefined") return [];

  // Migrate from legacy key if needed
  migrateFromLegacy();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parties = stored ? (JSON.parse(stored) as AdminParty[]) : [];
    cachedParties = parties;
    return parties;
  } catch {
    cachedParties = [];
    return [];
  }
}

function setStoredParties(parties: AdminParty[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
    cachedParties = parties; // Keep cache in sync
  } catch {
    // localStorage might be full or disabled
  }
}

export function saveAdminParty(slug: string, adminToken: string): void {
  const parties = getStoredParties();
  const existing = parties.findIndex((p) => p.slug === slug);

  if (existing >= 0) {
    parties[existing].adminToken = adminToken;
  } else {
    parties.push({ slug, adminToken });
  }

  setStoredParties(parties);
}

export function getAdminToken(slug: string): string | null {
  const parties = getStoredParties();
  const party = parties.find((p) => p.slug === slug);
  return party?.adminToken ?? null;
}

export function removeAdminParty(slug: string): void {
  const parties = getStoredParties();
  const filtered = parties.filter((p) => p.slug !== slug);
  setStoredParties(filtered);
}

export function getAllAdminParties(): AdminParty[] {
  return getStoredParties();
}

// For testing purposes only - clears the in-memory cache
export function _clearCache(): void {
  cachedParties = null;
}
