import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test-token" },
}));

import { issueUploadTicket, verifyUploadTicket } from "./upload-ticket";

const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const TTL_MS = 30 * 60 * 1000;

describe("upload tickets", () => {
  it("accepts a freshly issued ticket", () => {
    expect(verifyUploadTicket(issueUploadTicket(NOW), NOW)).toBe(true);
  });

  it("rejects it once the TTL has elapsed", () => {
    const ticket = issueUploadTicket(NOW);

    expect(verifyUploadTicket(ticket, NOW + TTL_MS - 1)).toBe(true);
    expect(verifyUploadTicket(ticket, NOW + TTL_MS + 1)).toBe(false);
  });

  it("rejects an extended expiry, since the expiry is signed", () => {
    const ticket = issueUploadTicket(NOW);
    const signature = ticket.slice(ticket.indexOf(".") + 1);
    const forged = `${NOW + 10 * 365 * 24 * 3600 * 1000}.${signature}`;

    expect(verifyUploadTicket(forged, NOW)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const ticket = issueUploadTicket(NOW);
    const [expiry, signature] = ticket.split(".");
    const flipped = signature.startsWith("0")
      ? `1${signature.slice(1)}`
      : `0${signature.slice(1)}`;

    expect(verifyUploadTicket(`${expiry}.${flipped}`, NOW)).toBe(false);
  });

  it.each(["", ".", "abc", "not-a-number.deadbeef", `${NOW}.`, `${NOW}.zz`])(
    "rejects the malformed ticket %j",
    (ticket) => {
      expect(verifyUploadTicket(ticket, NOW)).toBe(false);
    }
  );
});
