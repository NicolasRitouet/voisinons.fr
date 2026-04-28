import { describe, it, expect } from "vitest";
import { normalizeForSearch } from "./normalize";

describe("normalizeForSearch", () => {
  it("lowercases plain ASCII", () => {
    expect(normalizeForSearch("LYON")).toBe("lyon");
    expect(normalizeForSearch("Lyon")).toBe("lyon");
  });

  it("strips combining diacritics", () => {
    expect(normalizeForSearch("Évreux")).toBe("evreux");
    expect(normalizeForSearch("Saint-Étienne")).toBe("saint etienne");
    expect(normalizeForSearch("Hyères")).toBe("hyeres");
    expect(normalizeForSearch("L'Île-Rousse")).toBe("l ile rousse");
  });

  it("collapses non-alphanumerics into a single space", () => {
    expect(normalizeForSearch("Saint-Denis")).toBe("saint denis");
    expect(normalizeForSearch("Aix-en-Provence")).toBe("aix en provence");
    expect(normalizeForSearch("Rueil--Malmaison")).toBe("rueil malmaison");
    expect(normalizeForSearch("Paris  11")).toBe("paris 11");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeForSearch("  Lyon  ")).toBe("lyon");
    expect(normalizeForSearch("\nLyon\t")).toBe("lyon");
  });

  it("returns an empty string for empty or whitespace-only input", () => {
    expect(normalizeForSearch("")).toBe("");
    expect(normalizeForSearch("   ")).toBe("");
    expect(normalizeForSearch("---")).toBe("");
  });

  it("preserves digits", () => {
    expect(normalizeForSearch("Lyon 1er")).toBe("lyon 1er");
    expect(normalizeForSearch("Paris-15")).toBe("paris 15");
  });

  it("is idempotent", () => {
    const once = normalizeForSearch("Saint-Étienne-du-Rouvray");
    const twice = normalizeForSearch(once);
    expect(twice).toBe(once);
  });

  it("preserves the cedilla (ç) by stripping it like other diacritics", () => {
    expect(normalizeForSearch("Besançon")).toBe("besancon");
  });
});
