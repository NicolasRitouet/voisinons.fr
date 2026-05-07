import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("@/lib/db", () => ({
  db: {
    transaction: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    query: {
      parties: {
        findFirst: vi.fn(),
      },
      discussionChannels: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock the email module
vi.mock("@/lib/email", () => ({
  sendPartyCreatedEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock crypto utility
vi.mock("@/lib/crypto", () => ({
  generateToken: vi.fn(() => "mock-admin-token-1234567890abcdef"),
}));

// Mock Vercel Blob so we can assert whether del() is invoked
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/lib/db";
import { del } from "@vercel/blob";
import {
  createParty,
  checkSlugAvailability,
  createPartyUpdate,
  createDiscussionChannel,
  updatePartyDetails,
} from "./party";
import {
  publicPartyColumns,
  publicParticipantColumns,
} from "./party-public-columns";
import { parties, participants } from "@/lib/db/schema";

describe("party actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createParty", () => {
    it("should reject missing required fields", async () => {
      const result = await createParty({
        name: "",
        slug: "",
        placeType: "rue",
        address: "",
        date: "",
        timeStart: "",
        organizerName: "",
        organizerEmail: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid email", async () => {
      const result = await createParty({
        name: "Fête de la rue",
        slug: "fete-rue",
        placeType: "rue",
        address: "12 rue de la Paix, Paris",
        date: new Date().toISOString(),
        timeStart: "14:00",
        organizerName: "Jean Dupont",
        organizerEmail: "not-an-email",
      });

      expect(result.success).toBe(false);
    });

    it("should reject slug too short", async () => {
      const result = await createParty({
        name: "Fête de la rue",
        slug: "ab",
        placeType: "rue",
        address: "12 rue de la Paix, Paris",
        date: new Date().toISOString(),
        timeStart: "14:00",
        organizerName: "Jean Dupont",
        organizerEmail: "jean@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid time format", async () => {
      const result = await createParty({
        name: "Fête de la rue",
        slug: "fete-rue",
        placeType: "rue",
        address: "12 rue de la Paix, Paris",
        date: new Date().toISOString(),
        timeStart: "25:00",
        organizerName: "Jean Dupont",
        organizerEmail: "jean@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should create party with valid data", async () => {
      const mockParty = {
        id: "party-123",
        slug: "fete-rue-paix",
        adminToken: "mock-admin-token-1234567890abcdef",
      };

      (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(
        async (callback) => {
          const tx = {
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockParty]),
              }),
            }),
          };
          return callback(tx);
        }
      );

      const result = await createParty({
        name: "Fête de la rue de la Paix",
        slug: "fete-rue-paix",
        placeType: "rue",
        address: "12 rue de la Paix, 75001 Paris",
        date: new Date(2026, 4, 29).toISOString(),
        timeStart: "14:00",
        timeEnd: "21:00",
        organizerName: "Jean Dupont",
        organizerEmail: "jean@example.com",
        description: "Une super fête",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.party.slug).toBe("fete-rue-paix");
        expect(result.party.adminToken).toBeDefined();
      }
    });

    it("should handle duplicate slug error", async () => {
      // Mock that slug already exists
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "existing-party",
        slug: "existing-slug",
      });

      const result = await createParty({
        name: "Fête de la rue",
        slug: "existing-slug",
        placeType: "rue",
        address: "12 rue de la Paix, Paris",
        date: new Date().toISOString(),
        timeStart: "14:00",
        organizerName: "Jean Dupont",
        organizerEmail: "jean@example.com",
      });

      expect(result.success).toBe(false);
      expect((result.error as { slug?: string[] })?.slug?.[0]).toContain("déjà utilisé");
    });
  });

  describe("checkSlugAvailability", () => {
    it("should return true for available slug", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await checkSlugAvailability("new-slug");

      expect(result).toBe(true);
    });

    it("should return false for taken slug", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "existing-party",
        slug: "taken-slug",
      });

      const result = await checkSlugAvailability("taken-slug");

      expect(result).toBe(false);
    });

    it("should throw on database error", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error")
      );

      await expect(checkSlugAvailability("some-slug")).rejects.toThrow("DB error");
    });
  });

  describe("createPartyUpdate", () => {
    it("should reject unauthorized access", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "party-123",
        adminToken: "correct-token",
      });

      const result = await createPartyUpdate("party-123", "wrong-token", "Update content");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("should reject when party not found", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await createPartyUpdate("non-existent", "some-token", "Update content");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("should create update with valid token", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "party-123",
        adminToken: "correct-token",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await createPartyUpdate("party-123", "correct-token", "Nouvelle info!");

      expect(result.success).toBe(true);
    });

    it("should handle database errors", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "party-123",
        adminToken: "correct-token",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await createPartyUpdate("party-123", "correct-token", "Content");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Erreur");
    });
  });

  describe("updatePartyDetails", () => {
    const VALID_PARTY_ID = "550e8400-e29b-41d4-a716-446655440000";
    const ATTACKER_ID = "550e8400-e29b-41d4-a716-446655440001";
    const VICTIM_ID = "550e8400-e29b-41d4-a716-446655440002";
    const TOKEN = "valid-admin-token";
    const BLOB_HOST = "https://store.public.blob.vercel-storage.com";

    function blobUrl(name: string) {
      return `${BLOB_HOST}/party-cover/${name}.jpg`;
    }

    function buildPayload(overrides: Partial<Parameters<typeof updatePartyDetails>[0]> = {}) {
      return {
        partyId: VALID_PARTY_ID,
        token: TOKEN,
        address: "12 rue de la Paix, Paris",
        date: new Date(2026, 4, 29).toISOString(),
        timeStart: "18:00",
        timeEnd: "23:00",
        ...overrides,
      };
    }

    function mockUpdateNoop() {
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
    }

    it("calls del() on the previous Blob when replacing a cover the admin owns", async () => {
      const previous = blobUrl("owned");
      const next = blobUrl("new");

      // 1st findFirst: auth + previousCover. 2nd findFirst: stillReferenced check.
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ id: VALID_PARTY_ID, adminToken: TOKEN, coverImageUrl: previous })
        .mockResolvedValueOnce(null);
      mockUpdateNoop();

      const result = await updatePartyDetails(buildPayload({ coverImageUrl: next }));

      expect(result.success).toBe(true);
      expect(del).toHaveBeenCalledTimes(1);
      expect(del).toHaveBeenCalledWith(previous);
    });

    it("does NOT call del() when previousCover is still referenced by another party (anti arbitrary blob deletion)", async () => {
      // Attack scenario: attacker poisoned their own row with the victim's
      // Blob URL on a previous call. They now overwrite it; previousCover
      // is the victim's URL. The guard must recognize the URL is still
      // referenced and skip del().
      const stolen = blobUrl("victim");

      (db.query.parties.findFirst as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ id: ATTACKER_ID, adminToken: TOKEN, coverImageUrl: stolen })
        .mockResolvedValueOnce({ id: VICTIM_ID });
      mockUpdateNoop();

      const result = await updatePartyDetails(
        buildPayload({ partyId: ATTACKER_ID, coverImageUrl: "" })
      );

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalled();
    });

    it("does NOT call del() when previousCover is null", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: VALID_PARTY_ID,
        adminToken: TOKEN,
        coverImageUrl: null,
      });
      mockUpdateNoop();

      const result = await updatePartyDetails(buildPayload({ coverImageUrl: blobUrl("first") }));

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalled();
    });

    it("does NOT call del() for non-Vercel-Blob URLs (legacy UploadThing leftovers)", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: VALID_PARTY_ID,
        adminToken: TOKEN,
        coverImageUrl: "https://utfs.io/f/legacy-key",
      });
      mockUpdateNoop();

      const result = await updatePartyDetails(buildPayload({ coverImageUrl: blobUrl("new") }));

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalled();
    });

    it("does NOT call del() when the URL is unchanged", async () => {
      const same = blobUrl("same");
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: VALID_PARTY_ID,
        adminToken: TOKEN,
        coverImageUrl: same,
      });
      mockUpdateNoop();

      const result = await updatePartyDetails(buildPayload({ coverImageUrl: same }));

      expect(result.success).toBe(true);
      expect(del).not.toHaveBeenCalled();
    });

    it("rejects an invalid admin token without touching del()", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: VALID_PARTY_ID,
        adminToken: "different-token",
        coverImageUrl: blobUrl("anything"),
      });

      const result = await updatePartyDetails(buildPayload({ coverImageUrl: "" }));

      expect(result.success).toBe(false);
      expect(del).not.toHaveBeenCalled();
    });
  });

  describe("createDiscussionChannel", () => {
    it("should reject invalid URL", async () => {
      const result = await createDiscussionChannel({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "valid-token",
        type: "whatsapp",
        name: "Groupe WhatsApp",
        url: "not-a-url",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unauthorized access", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        adminToken: "correct-token",
      });

      const result = await createDiscussionChannel({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "wrong-token",
        type: "whatsapp",
        name: "Groupe WhatsApp",
        url: "https://chat.whatsapp.com/invite123",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form).toContain("Non autorisé");
    });

    it("should create channel with valid data", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        adminToken: "correct-token",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await createDiscussionChannel({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "correct-token",
        type: "whatsapp",
        name: "Groupe WhatsApp",
        url: "https://chat.whatsapp.com/invite123",
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("public read-model column allowlists", () => {
  // These constants drive what getPartyBySlug returns to unauthenticated
  // visitors via Server Components. A regression here re-introduces the
  // adminToken / editToken / PII leak that motivated the security fix.
  const FORBIDDEN_PARTY_COLUMNS = [
    "adminToken",
    "accessCode",
    "organizerEmail",
  ] as const;
  const FORBIDDEN_PARTICIPANT_COLUMNS = [
    "editToken",
    "email",
    "phone",
  ] as const;

  it("publicPartyColumns excludes secret and PII columns", () => {
    for (const col of FORBIDDEN_PARTY_COLUMNS) {
      expect(publicPartyColumns).not.toHaveProperty(col);
    }
  });

  it("publicParticipantColumns excludes the editToken credential and PII", () => {
    for (const col of FORBIDDEN_PARTICIPANT_COLUMNS) {
      expect(publicParticipantColumns).not.toHaveProperty(col);
    }
  });

  it("publicPartyColumns references only real columns on the parties table", () => {
    const realColumns = Object.keys(parties);
    for (const col of Object.keys(publicPartyColumns)) {
      expect(realColumns).toContain(col);
    }
  });

  it("publicParticipantColumns references only real columns on the participants table", () => {
    const realColumns = Object.keys(participants);
    for (const col of Object.keys(publicParticipantColumns)) {
      expect(realColumns).toContain(col);
    }
  });
});
