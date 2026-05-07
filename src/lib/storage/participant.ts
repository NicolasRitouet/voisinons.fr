const VERSION = "v1";

export function getParticipantIdKey(partySlug: string) {
  return `voisinons_participant:${VERSION}:${partySlug}`;
}

export function getParticipantTokenKey(partySlug: string) {
  return `voisinons_participant_token:${VERSION}:${partySlug}`;
}

// In-memory cache for participant data
const participantCache = new Map<string, string | null>();

export function getParticipantId(partySlug: string): string | null {
  const key = getParticipantIdKey(partySlug);
  if (participantCache.has(key)) {
    return participantCache.get(key) ?? null;
  }

  if (typeof window === "undefined") return null;

  try {
    // Try versioned key first
    let value = localStorage.getItem(key);

    // Migrate from legacy key if needed
    if (!value) {
      const legacyKey = `voisinons_participant_${partySlug}`;
      value = localStorage.getItem(legacyKey);
      if (value) {
        localStorage.setItem(key, value);
        localStorage.removeItem(legacyKey);
      }
    }

    participantCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

export function getParticipantToken(partySlug: string): string | null {
  const key = getParticipantTokenKey(partySlug);
  if (participantCache.has(key)) {
    return participantCache.get(key) ?? null;
  }

  if (typeof window === "undefined") return null;

  try {
    // Try versioned key first
    let value = localStorage.getItem(key);

    // Migrate from legacy key if needed
    if (!value) {
      const legacyKey = `voisinons_participant_token_${partySlug}`;
      value = localStorage.getItem(legacyKey);
      if (value) {
        localStorage.setItem(key, value);
        localStorage.removeItem(legacyKey);
      }
    }

    participantCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

export function setParticipantToken(partySlug: string, token: string): void {
  if (typeof window === "undefined") return;
  const key = getParticipantTokenKey(partySlug);
  try {
    localStorage.setItem(key, token);
    participantCache.set(key, token);
  } catch {
    // localStorage might be full or disabled
  }
}

export function removeParticipantToken(partySlug: string): void {
  if (typeof window === "undefined") return;
  const key = getParticipantTokenKey(partySlug);
  try {
    localStorage.removeItem(key);
    participantCache.delete(key);
  } catch {
    // Ignore errors
  }
}

export function removeParticipantId(partySlug: string): void {
  if (typeof window === "undefined") return;
  const key = getParticipantIdKey(partySlug);
  try {
    localStorage.removeItem(key);
    participantCache.delete(key);
  } catch {
    // Ignore errors
  }
}
