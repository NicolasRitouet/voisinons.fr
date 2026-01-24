import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      parties: {
        findFirst: vi.fn(),
      },
      needs: {
        findFirst: vi.fn(),
      },
    },
  },
}));

import { db } from "@/lib/db";
import { createNeedCategory, deleteNeedCategory } from "./need";

describe("need actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNeedCategory", () => {
    it("should reject invalid party id", async () => {
      const result = await createNeedCategory({
        partyId: "not-a-uuid",
        token: "valid-token",
        category: "nourriture_sale",
        description: "Plat salé",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty description", async () => {
      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "valid-token",
        category: "nourriture_sale",
        description: "",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid category", async () => {
      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "valid-token",
        category: "invalid_category" as "nourriture_sale",
        description: "Test",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unauthorized access", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        adminToken: "correct-token",
      });

      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "wrong-token",
        category: "nourriture_sale",
        description: "Plat salé",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form).toContain("Non autorisé");
    });

    it("should reject when party not found", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "some-token",
        category: "nourriture_sale",
        description: "Plat salé",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form).toContain("Non autorisé");
    });

    it("should create need category with valid data and token", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        adminToken: "correct-token",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "correct-token",
        category: "nourriture_sale",
        description: "Plat salé",
      });

      expect(result.success).toBe(true);
    });

    it("should handle database errors", async () => {
      (db.query.parties.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        adminToken: "correct-token",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      (db.insert as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await createNeedCategory({
        partyId: "550e8400-e29b-41d4-a716-446655440000",
        token: "correct-token",
        category: "nourriture_sale",
        description: "Plat salé",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form?.[0]).toContain("erreur");
    });
  });

  describe("deleteNeedCategory", () => {
    it("should reject invalid need id", async () => {
      const result = await deleteNeedCategory({
        needId: "not-a-uuid",
        token: "valid-token",
      });

      expect(result.success).toBe(false);
    });

    it("should reject when need not found", async () => {
      (db.query.needs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await deleteNeedCategory({
        needId: "550e8400-e29b-41d4-a716-446655440000",
        token: "some-token",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form?.[0]).toContain("introuvable");
    });

    it("should reject unauthorized access", async () => {
      (db.query.needs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "need-123",
        partyId: "party-123",
        party: {
          id: "party-123",
          adminToken: "correct-token",
        },
      });

      const result = await deleteNeedCategory({
        needId: "550e8400-e29b-41d4-a716-446655440000",
        token: "wrong-token",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form).toContain("Non autorisé");
    });

    it("should delete need with valid token", async () => {
      (db.query.needs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        partyId: "party-123",
        party: {
          id: "party-123",
          adminToken: "correct-token",
        },
      });

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      (db.delete as ReturnType<typeof vi.fn>).mockImplementation(mockDelete);

      const result = await deleteNeedCategory({
        needId: "550e8400-e29b-41d4-a716-446655440000",
        token: "correct-token",
      });

      expect(result.success).toBe(true);
    });

    it("should handle database errors", async () => {
      (db.query.needs.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        partyId: "party-123",
        party: {
          id: "party-123",
          adminToken: "correct-token",
        },
      });

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      (db.delete as ReturnType<typeof vi.fn>).mockImplementation(mockDelete);

      const result = await deleteNeedCategory({
        needId: "550e8400-e29b-41d4-a716-446655440000",
        token: "correct-token",
      });

      expect(result.success).toBe(false);
      expect((result.error as { _form?: string[] })?._form?.[0]).toContain("erreur");
    });
  });
});
