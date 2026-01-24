import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    query: {
      parties: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock the email module
vi.mock("@/lib/email", () => ({
  sendParticipantEditEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock crypto utility
vi.mock("@/lib/crypto", () => ({
  generateToken: vi.fn(() => "mock-token-1234567890abcdef"),
}));

import { db } from "@/lib/db";
import {
  joinParty,
  getParticipantById,
  getParticipantByToken,
  updateParticipant,
} from "./participant";

describe("participant actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("joinParty", () => {
    it("should reject invalid data", async () => {
      const result = await joinParty({
        partyId: "not-a-uuid",
        name: "A",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty("error");
    });

    it("should reject name too short", async () => {
      const result = await joinParty({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        name: "A",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("2 caractères");
    });

    it("should reject invalid email", async () => {
      const result = await joinParty({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        email: "not-an-email",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("invalide");
    });

    it("should reject guest count over 20", async () => {
      const result = await joinParty({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        guestCount: 21,
      });

      expect(result.success).toBe(false);
    });

    it("should create participant with valid data", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "participant-123" }]),
        }),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await joinParty({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        guestCount: 2,
        bringing: "Salade",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.participantId).toBe("participant-123");
        expect(result.editToken).toBe("mock-token-1234567890abcdef");
      }
    });

    it("should handle database errors gracefully", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await joinParty({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("erreur");
    });
  });

  describe("getParticipantById", () => {
    it("should return participant when found", async () => {
      const mockParticipant = {
        id: "participant-123",
        name: "Jean Dupont",
        email: "jean@example.com",
        guestCount: 2,
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockParticipant]),
          }),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getParticipantById("participant-123");

      expect(result).toEqual(mockParticipant);
    });

    it("should return null when not found", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getParticipantById("non-existent");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("DB error")),
          }),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getParticipantById("participant-123");

      expect(result).toBeNull();
    });
  });

  describe("getParticipantByToken", () => {
    it("should return participant when token matches", async () => {
      const mockParticipant = {
        id: "participant-123",
        name: "Jean Dupont",
        editToken: "valid-token",
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockParticipant]),
          }),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getParticipantByToken("valid-token");

      expect(result).toEqual(mockParticipant);
    });

    it("should return null for invalid token", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      (db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const result = await getParticipantByToken("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("updateParticipant", () => {
    it("should reject when neither id nor token provided", async () => {
      const result = await updateParticipant({
        name: "Jean Dupont",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Identifiant");
    });

    it("should reject invalid name", async () => {
      const result = await updateParticipant({
        participantId: "550e8400-e29b-41d4-a716-446655440000",
        name: "J",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("2 caractères");
    });

    it("should update participant by id", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "participant-123" }]),
          }),
        }),
      });
      (db.update as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const result = await updateParticipant({
        participantId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont Modifié",
        guestCount: 3,
      });

      expect(result.success).toBe(true);
    });

    it("should update participant by token", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "participant-123" }]),
          }),
        }),
      });
      (db.update as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const result = await updateParticipant({
        editToken: "valid-token-1234",
        name: "Jean Dupont Modifié",
        guestCount: 3,
      });

      expect(result.success).toBe(true);
    });

    it("should return error when participant not found", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });
      (db.update as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const result = await updateParticipant({
        participantId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("non trouvé");
    });
  });
});
