import { describe, it, expect } from "vitest";
import { SUBJECT, buildBody, buildMailtoHref } from "./mail-template";

describe("buildBody", () => {
  it("interpolates the commune name into the body", () => {
    const body = buildBody("Lyon");
    expect(body).toContain("à Lyon");
    expect(body).toContain("La mairie de Lyon");
  });

  it("references the commune at every expected occurrence", () => {
    const body = buildBody("Saint-Étienne");
    const matches = body.match(/Saint-Étienne/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the placeholder fields the user must personalize", () => {
    const body = buildBody("Lyon");
    expect(body).toContain("[Votre prénom et nom]");
    expect(body).toContain("[adresse exacte]");
    expect(body).toContain("[Votre numéro de téléphone]");
    expect(body).toContain("[préciser :");
  });

  it("mentions the canonical date 2026-05-29", () => {
    const body = buildBody("Lyon");
    expect(body).toContain("vendredi 29 mai 2026");
  });
});

describe("buildMailtoHref", () => {
  it("returns a mailto: scheme with encoded subject and body", () => {
    const href = buildMailtoHref("mairie@lyon.fr", "Sujet test", "Corps test");
    expect(href.startsWith("mailto:")).toBe(true);
    expect(href).toContain("mairie%40lyon.fr");
    expect(href).toContain("subject=Sujet%20test");
    expect(href).toContain("body=Corps%20test");
  });

  it("encodes spaces, accents and reserved characters", () => {
    const href = buildMailtoHref(
      "mairie@évreux.fr",
      "Hé / là",
      "Bonjour & au revoir"
    );
    // Decoding the href params must round-trip
    const url = new URL(href);
    const params = new URLSearchParams(url.search);
    expect(decodeURIComponent(url.pathname)).toBe("mairie@évreux.fr");
    expect(params.get("subject")).toBe("Hé / là");
    expect(params.get("body")).toBe("Bonjour & au revoir");
  });
});

describe("SUBJECT", () => {
  it("references the canonical event date", () => {
    expect(SUBJECT).toContain("29 mai 2026");
  });
});
