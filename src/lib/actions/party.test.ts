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

import { db } from "@/lib/db";
import {
  createParty,
  checkSlugAvailability,
  createPartyUpdate,
  createDiscussionChannel,
} from "./party";

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
