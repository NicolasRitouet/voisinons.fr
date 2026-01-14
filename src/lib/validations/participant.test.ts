import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the schemas here for testing (since they're in server actions)
const joinPartySchema = z.object({
  partyId: z.string().uuid(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

const updateParticipantSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

describe("joinPartySchema", () => {
  const validData = {
    partyId: "550e8400-e29b-41d4-a716-446655440000",
    name: "Marie Martin",
    email: "marie@example.com",
    phone: "0612345678",
    guestCount: 2,
    bringing: "Une salade",
  };

  describe("valid inputs", () => {
    it("should accept valid participant data", () => {
      const result = joinPartySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept participant without email", () => {
      const data = { ...validData, email: undefined };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept participant without phone", () => {
      const data = { ...validData, phone: undefined };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept participant without bringing", () => {
      const data = { ...validData, bringing: undefined };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should default guestCount to 1", () => {
      const data = { ...validData, guestCount: undefined };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guestCount).toBe(1);
      }
    });
  });

  describe("partyId validation", () => {
    it("should reject invalid UUID", () => {
      const data = { ...validData, partyId: "invalid-uuid" };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty partyId", () => {
      const data = { ...validData, partyId: "" };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("name validation", () => {
    it("should reject name shorter than 2 characters", () => {
      const data = { ...validData, name: "A" };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("2 caractères");
      }
    });

    it("should accept name with 2 characters", () => {
      const data = { ...validData, name: "Jo" };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("email validation", () => {
    it("should reject invalid email format", () => {
      const data = { ...validData, email: "not-an-email" };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
      ];

      for (const email of validEmails) {
        const data = { ...validData, email };
        const result = joinPartySchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("guestCount validation", () => {
    it("should reject guestCount less than 1", () => {
      const data = { ...validData, guestCount: 0 };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject guestCount greater than 20", () => {
      const data = { ...validData, guestCount: 21 };
      const result = joinPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept guestCount between 1 and 20", () => {
      for (const guestCount of [1, 5, 10, 20]) {
        const data = { ...validData, guestCount };
        const result = joinPartySchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });
});

describe("updateParticipantSchema", () => {
  const validData = {
    participantId: "550e8400-e29b-41d4-a716-446655440000",
    name: "Marie Martin",
    email: "marie@example.com",
    guestCount: 3,
    bringing: "Un gâteau",
  };

  it("should accept valid update data", () => {
    const result = updateParticipantSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid participantId", () => {
    const data = { ...validData, participantId: "invalid" };
    const result = updateParticipantSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject name too short", () => {
    const data = { ...validData, name: "A" };
    const result = updateParticipantSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
