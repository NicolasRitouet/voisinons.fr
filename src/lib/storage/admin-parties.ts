const STORAGE_KEY = "voisinons_admin_parties";

type AdminParty = {
  slug: string;
  adminToken: string;
};

function getStoredParties(): AdminParty[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredParties(parties: AdminParty[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
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
