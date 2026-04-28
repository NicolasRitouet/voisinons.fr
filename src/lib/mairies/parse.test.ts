import { describe, it, expect } from "vitest";
import { extractCommuneAndCp, extractFirstPhone } from "./parse";

describe("extractCommuneAndCp", () => {
  it("returns commune and code postal from a valid payload", () => {
    const raw = JSON.stringify([
      { nom_commune: "Longeville", code_postal: "25330" },
    ]);
    expect(extractCommuneAndCp(raw)).toEqual({
      commune: "Longeville",
      cp: "25330",
    });
  });

  it("trims whitespace in the extracted values", () => {
    const raw = JSON.stringify([
      { nom_commune: "  Lyon  ", code_postal: " 69001 " },
    ]);
    expect(extractCommuneAndCp(raw)).toEqual({ commune: "Lyon", cp: "69001" });
  });

  it("uses the first entry when multiple addresses are returned", () => {
    const raw = JSON.stringify([
      { nom_commune: "Lyon", code_postal: "69001" },
      { nom_commune: "Other", code_postal: "00000" },
    ]);
    expect(extractCommuneAndCp(raw)).toEqual({ commune: "Lyon", cp: "69001" });
  });

  it("returns null when raw is null", () => {
    expect(extractCommuneAndCp(null)).toBeNull();
  });

  it("returns null on malformed JSON", () => {
    expect(extractCommuneAndCp("not-json")).toBeNull();
  });

  it("returns null when the JSON is not an array", () => {
    expect(
      extractCommuneAndCp(
        JSON.stringify({ nom_commune: "Lyon", code_postal: "69001" })
      )
    ).toBeNull();
  });

  it("returns null on an empty array", () => {
    expect(extractCommuneAndCp("[]")).toBeNull();
  });

  it("returns null when nom_commune is missing", () => {
    const raw = JSON.stringify([{ code_postal: "69001" }]);
    expect(extractCommuneAndCp(raw)).toBeNull();
  });

  it("returns null when code_postal is missing", () => {
    const raw = JSON.stringify([{ nom_commune: "Lyon" }]);
    expect(extractCommuneAndCp(raw)).toBeNull();
  });

  it("returns null when nom_commune is an empty string", () => {
    const raw = JSON.stringify([{ nom_commune: "", code_postal: "69001" }]);
    expect(extractCommuneAndCp(raw)).toBeNull();
  });
});

describe("extractFirstPhone", () => {
  it("returns the first phone value from a single-entry payload", () => {
    const raw = JSON.stringify([
      { valeur: "03 81 86 52 46", description: "" },
    ]);
    expect(extractFirstPhone(raw)).toBe("03 81 86 52 46");
  });

  it("trims surrounding whitespace", () => {
    const raw = JSON.stringify([{ valeur: "  04 78 00 00 00  " }]);
    expect(extractFirstPhone(raw)).toBe("04 78 00 00 00");
  });

  it("skips empty entries to find the first usable one", () => {
    const raw = JSON.stringify([
      { valeur: "" },
      { valeur: "   " },
      { valeur: "01 23 45 67 89" },
    ]);
    expect(extractFirstPhone(raw)).toBe("01 23 45 67 89");
  });

  it("returns null when raw is null", () => {
    expect(extractFirstPhone(null)).toBeNull();
  });

  it("returns null on malformed JSON", () => {
    expect(extractFirstPhone("not-json")).toBeNull();
  });

  it("returns null when the JSON is not an array", () => {
    expect(extractFirstPhone(JSON.stringify({ valeur: "01 02 03 04 05" }))).toBeNull();
  });

  it("returns null on empty array", () => {
    expect(extractFirstPhone("[]")).toBeNull();
  });

  it("returns null when every entry has an empty value", () => {
    const raw = JSON.stringify([{ valeur: "" }, { valeur: "   " }]);
    expect(extractFirstPhone(raw)).toBeNull();
  });
});
