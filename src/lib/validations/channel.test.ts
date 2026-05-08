import { describe, it, expect } from "vitest";
import {
  createChannelSchema,
  updateChannelSchema,
  isSafeChannelUrl,
} from "./channel";

const validCreate = {
  partyId: "550e8400-e29b-41d4-a716-446655440000",
  token: "valid-admin-token-1234",
  type: "whatsapp" as const,
  name: "Groupe WhatsApp",
  url: "https://chat.whatsapp.com/abc",
};

const validUpdate = {
  channelId: "550e8400-e29b-41d4-a716-446655440000",
  token: "valid-admin-token-1234",
  type: "whatsapp" as const,
  name: "Groupe WhatsApp",
  url: "https://chat.whatsapp.com/abc",
};

describe("isSafeChannelUrl", () => {
  it.each(["http:", "https:", "mailto:", "tel:"])(
    "accepts %s scheme",
    (scheme) => {
      const url =
        scheme === "mailto:"
          ? "mailto:hi@example.com"
          : scheme === "tel:"
            ? "tel:+33123456789"
            : `${scheme}//example.com`;
      expect(isSafeChannelUrl(url)).toBe(true);
    }
  );

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "ftp://example.com",
  ])("rejects dangerous scheme %s", (url) => {
    expect(isSafeChannelUrl(url)).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isSafeChannelUrl("not a url")).toBe(false);
    expect(isSafeChannelUrl("")).toBe(false);
  });
});

describe("createChannelSchema", () => {
  it("accepts a valid https URL", () => {
    const result = createChannelSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("rejects dangerous scheme %s (regression: stored XSS)", (url) => {
    const result = createChannelSchema.safeParse({ ...validCreate, url });
    expect(result.success).toBe(false);
  });

  it("rejects URLs longer than 2048 characters", () => {
    const url = "https://example.com/" + "a".repeat(2050);
    const result = createChannelSchema.safeParse({ ...validCreate, url });
    expect(result.success).toBe(false);
  });
});

describe("updateChannelSchema", () => {
  it("rejects javascript: scheme on update path too", () => {
    const result = updateChannelSchema.safeParse({
      ...validUpdate,
      url: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });
});
