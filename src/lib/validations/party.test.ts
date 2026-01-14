import { describe, it, expect } from "vitest";
import {
  createPartySchema,
  parseAddress,
  generatePartyNameFromAddress,
  generateSlugFromAddress,
  generateSlug,
  placeTypes,
} from "./party";

describe("createPartySchema", () => {
  const validData = {
    name: "Fête de la rue Jaboulay",
    slug: "rue-jaboulay-lyon",
    placeType: "rue" as const,
    address: "15 rue Jaboulay, 69007 Lyon",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    timeStart: "14:00",
    timeEnd: "21:00",
    description: "Une super fête de voisins",
    isPrivate: false,
    organizerName: "Jean Dupont",
    organizerEmail: "jean@example.com",
  };

  describe("valid inputs", () => {
    it("should accept valid party data", () => {
      const result = createPartySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept party without timeEnd", () => {
      const data = { ...validData, timeEnd: "" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept party without description", () => {
      const data = { ...validData, description: undefined };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all place types", () => {
      for (const placeType of placeTypes) {
        const data = { ...validData, placeType };
        const result = createPartySchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("name validation", () => {
    it("should reject name shorter than 3 characters", () => {
      const data = { ...validData, name: "AB" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("3 caractères");
      }
    });

    it("should reject name longer than 255 characters", () => {
      const data = { ...validData, name: "A".repeat(256) };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("slug validation", () => {
    it("should reject slug shorter than 3 characters", () => {
      const data = { ...validData, slug: "ab" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject slug with uppercase letters", () => {
      const data = { ...validData, slug: "Rue-Jaboulay" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject slug with special characters", () => {
      const data = { ...validData, slug: "rue_jaboulay" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid slug with numbers", () => {
      const data = { ...validData, slug: "rue-jaboulay-69007" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("date validation", () => {
    it("should reject past date", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const data = { ...validData, date: pastDate };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept today's date", () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const data = { ...validData, date: today.toISOString() };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("time validation", () => {
    it("should reject invalid time format", () => {
      const data = { ...validData, timeStart: "14h00" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject timeEnd before timeStart", () => {
      const data = { ...validData, timeStart: "18:00", timeEnd: "14:00" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("après");
      }
    });
  });

  describe("email validation", () => {
    it("should reject invalid email", () => {
      const data = { ...validData, organizerEmail: "invalid-email" };
      const result = createPartySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe("parseAddress", () => {
  it("should parse standard French address", () => {
    const result = parseAddress("15 rue Jaboulay, 69007 Lyon");
    expect(result.street).toBe("rue Jaboulay");
    expect(result.city).toBe("Lyon");
  });

  it("should handle address without number", () => {
    const result = parseAddress("Place de la République, 75003 Paris");
    expect(result.street).toBe("Place de la République");
    expect(result.city).toBe("Paris");
  });

  it("should handle 'bis' addresses", () => {
    const result = parseAddress("15 bis rue du Commerce, 75015 Paris");
    expect(result.street).toBe("rue du Commerce");
    expect(result.city).toBe("Paris");
  });

  it("should handle address with country", () => {
    const result = parseAddress("10 avenue des Champs-Élysées, 75008 Paris, France");
    expect(result.city).toBe("Paris");
  });
});

describe("generatePartyNameFromAddress", () => {
  it("should generate party name from address", () => {
    const result = generatePartyNameFromAddress("15 rue Jaboulay, 69007 Lyon");
    expect(result).toBe("Fête de la Rue Jaboulay");
  });

  it("should handle Place addresses", () => {
    const result = generatePartyNameFromAddress("Place de la République, 75003 Paris");
    expect(result).toBe("Fête de la Place de la République");
  });

  it("should return empty string for empty address", () => {
    const result = generatePartyNameFromAddress("");
    expect(result).toBe("");
  });
});

describe("generateSlugFromAddress", () => {
  it("should generate slug from address", () => {
    const result = generateSlugFromAddress("15 rue Jaboulay, 69007 Lyon");
    expect(result).toBe("rue-jaboulay-lyon");
  });

  it("should remove accents", () => {
    const result = generateSlugFromAddress("Rue de la République, 69001 Lyon");
    expect(result).toContain("republique");
    expect(result).not.toContain("é");
  });

  it("should handle special characters", () => {
    const result = generateSlugFromAddress("Avenue des Champs-Élysées, 75008 Paris");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  it("should limit slug to 100 characters", () => {
    const longAddress = "A".repeat(200) + ", 75001 Paris";
    const result = generateSlugFromAddress(longAddress);
    expect(result.length).toBeLessThanOrEqual(100);
  });
});

describe("generateSlug", () => {
  it("should generate slug from name", () => {
    const result = generateSlug("Fête de la rue Jaboulay");
    expect(result).toBe("fete-de-la-rue-jaboulay");
  });

  it("should remove accents", () => {
    const result = generateSlug("Fête des voisins à Lyon");
    expect(result).toBe("fete-des-voisins-a-lyon");
  });

  it("should handle special characters", () => {
    const result = generateSlug("Fête @#$ spéciale!");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });
});
