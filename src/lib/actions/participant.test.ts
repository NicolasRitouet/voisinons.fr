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
  sendOrganizerNewParticipantEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock crypto utility
vi.mock("@/lib/crypto", () => ({
  generateToken: vi.fn(() => "mock-token-1234567890abcdef"),
}));

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { sendOrganizerNewParticipantEmail } from "@/lib/email";
import { mockParty } from "@/test/mocks/db";
import {
  joinParty,
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

    it("notifies the organizer when notifyOnNewParticipant is enabled", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "participant-1" }]),
        }),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockParty,
        notifyOnNewParticipant: true,
      });

      await joinParty({
        partyId: mockParty.id,
        name: "Bob",
        guestCount: 2,
        bringing: "Tarte aux pommes",
      });

      expect(sendOrganizerNewParticipantEmail).toHaveBeenCalledTimes(1);
      expect(sendOrganizerNewParticipantEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockParty.organizerEmail,
          organizerName: mockParty.organizerName,
          partyName: mockParty.name,
          partySlug: mockParty.slug,
          adminToken: mockParty.adminToken,
          participantName: "Bob",
          participantBringing: "Tarte aux pommes",
          participantGuestCount: 2,
        })
      );
    });

    it("does NOT notify the organizer when notifyOnNewParticipant is disabled", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "participant-2" }]),
        }),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockParty
      );

      await joinParty({
        partyId: mockParty.id,
        name: "Bob",
        guestCount: 1,
      });

      expect(sendOrganizerNewParticipantEmail).not.toHaveBeenCalled();
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
    // We deliberately call updateParticipant with malformed inputs to assert
    // that runtime validation rejects them. TypeScript would catch most of
    // these at compile time, but the action is reachable from the network
    // (Server Actions are public HTTP endpoints) so the runtime guard matters.
    type AnyUpdateInput = Parameters<typeof updateParticipant>[0];

    it("should reject when editToken is missing", async () => {
      const result = await updateParticipant({
        name: "Jean Dupont",
        guestCount: 1,
      } as unknown as AnyUpdateInput);

      expect(result.success).toBe(false);
      expect(result).toHaveProperty("error");
    });

    it("should reject participantId fallback (regression: ACL bypass)", async () => {
      const result = await updateParticipant({
        participantId: "550e8400-e29b-41d4-a716-446655440000",
        name: "Jean Dupont",
        guestCount: 1,
      } as unknown as AnyUpdateInput);

      expect(result.success).toBe(false);
      expect(result).toHaveProperty("error");
    });

    it("should reject invalid name", async () => {
      const result = await updateParticipant({
        editToken: "valid-token-1234567890",
        name: "J",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("2 caractères");
    });

    it("should update participant by token and scope the WHERE to editToken", async () => {
      // The entire credential check is the WHERE clause; assert the column,
      // otherwise a typo could silently lookup by id instead of editToken.
      const mockWhere = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "participant-123" }]),
      });
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: mockWhere,
        }),
      });
      (db.update as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const editToken = "valid-token-1234567890";
      const result = await updateParticipant({
        editToken,
        name: "Jean Dupont Modifié",
        guestCount: 3,
      });

      expect(result.success).toBe(true);
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(mockWhere).toHaveBeenCalledWith(
        eq(participants.editToken, editToken)
      );
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
        editToken: "valid-token-1234567890",
        name: "Jean Dupont",
        guestCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("non trouvé");
    });
  });
});
