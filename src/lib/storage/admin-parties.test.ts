import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveAdminParty,
  getAdminToken,
  removeAdminParty,
  getAllAdminParties,
} from "./admin-parties";

describe("admin-parties storage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveAdminParty", () => {
    it("should save a new party to localStorage", () => {
      saveAdminParty("ma-fete", "token123");

      const stored = JSON.parse(
        localStorage.getItem("voisinons_admin_parties") || "[]"
      );
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual({ slug: "ma-fete", adminToken: "token123" });
    });

    it("should save multiple parties", () => {
      saveAdminParty("fete-1", "token1");
      saveAdminParty("fete-2", "token2");
      saveAdminParty("fete-3", "token3");

      const stored = JSON.parse(
        localStorage.getItem("voisinons_admin_parties") || "[]"
      );
      expect(stored).toHaveLength(3);
    });

    it("should update token if party already exists", () => {
      saveAdminParty("ma-fete", "old-token");
      saveAdminParty("ma-fete", "new-token");

      const stored = JSON.parse(
        localStorage.getItem("voisinons_admin_parties") || "[]"
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].adminToken).toBe("new-token");
    });
  });

  describe("getAdminToken", () => {
    it("should return token for existing party", () => {
      saveAdminParty("ma-fete", "token123");

      const token = getAdminToken("ma-fete");
      expect(token).toBe("token123");
    });

    it("should return null for non-existing party", () => {
      const token = getAdminToken("non-existant");
      expect(token).toBeNull();
    });

    it("should return null when localStorage is empty", () => {
      const token = getAdminToken("ma-fete");
      expect(token).toBeNull();
    });

    it("should return correct token when multiple parties exist", () => {
      saveAdminParty("fete-1", "token1");
      saveAdminParty("fete-2", "token2");
      saveAdminParty("fete-3", "token3");

      expect(getAdminToken("fete-1")).toBe("token1");
      expect(getAdminToken("fete-2")).toBe("token2");
      expect(getAdminToken("fete-3")).toBe("token3");
    });
  });

  describe("removeAdminParty", () => {
    it("should remove existing party", () => {
      saveAdminParty("ma-fete", "token123");
      removeAdminParty("ma-fete");

      const token = getAdminToken("ma-fete");
      expect(token).toBeNull();
    });

    it("should not affect other parties when removing one", () => {
      saveAdminParty("fete-1", "token1");
      saveAdminParty("fete-2", "token2");
      saveAdminParty("fete-3", "token3");

      removeAdminParty("fete-2");

      expect(getAdminToken("fete-1")).toBe("token1");
      expect(getAdminToken("fete-2")).toBeNull();
      expect(getAdminToken("fete-3")).toBe("token3");
    });

    it("should handle removing non-existing party gracefully", () => {
      saveAdminParty("ma-fete", "token123");

      // Should not throw
      expect(() => removeAdminParty("non-existant")).not.toThrow();

      // Original party should still exist
      expect(getAdminToken("ma-fete")).toBe("token123");
    });
  });

  describe("getAllAdminParties", () => {
    it("should return empty array when no parties stored", () => {
      const parties = getAllAdminParties();
      expect(parties).toEqual([]);
    });

    it("should return all stored parties", () => {
      saveAdminParty("fete-1", "token1");
      saveAdminParty("fete-2", "token2");

      const parties = getAllAdminParties();
      expect(parties).toHaveLength(2);
      expect(parties).toContainEqual({ slug: "fete-1", adminToken: "token1" });
      expect(parties).toContainEqual({ slug: "fete-2", adminToken: "token2" });
    });
  });

  describe("error handling", () => {
    it("should handle corrupted localStorage data gracefully", () => {
      localStorage.setItem("voisinons_admin_parties", "not valid json");

      // Should not throw and return null/empty
      expect(() => getAdminToken("ma-fete")).not.toThrow();
      expect(getAdminToken("ma-fete")).toBeNull();
      expect(getAllAdminParties()).toEqual([]);
    });

    it("should handle localStorage being unavailable", () => {
      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;

      // Mock localStorage to throw
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      // Should not throw
      expect(() => saveAdminParty("ma-fete", "token")).not.toThrow();
      expect(() => getAdminToken("ma-fete")).not.toThrow();
      expect(getAllAdminParties()).toEqual([]);

      // Restore
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
    });
  });
});
