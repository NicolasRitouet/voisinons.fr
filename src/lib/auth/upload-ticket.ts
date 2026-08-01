import { createHmac, hkdfSync, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

// Long enough to fill in the create form, short enough that a leaked ticket
// isn't a durable upload permit.
const TICKET_TTL_MS = 30 * 60 * 1000;
const PAYLOAD_PREFIX = "upload:";

// Derived from the Blob write token rather than a dedicated env var: the secret
// that can already write to the store is the natural gate for handing out write
// permits, and it needs no extra provisioning at deploy time.
let cachedKey: Buffer | null = null;

function signingKey(): Buffer {
  if (!cachedKey) {
    if (!env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is required to sign upload tickets");
    }
    cachedKey = Buffer.from(
      hkdfSync("sha256", env.BLOB_READ_WRITE_TOKEN, "", "voisinons-upload-ticket", 32)
    );
  }
  return cachedKey;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", signingKey())
    .update(`${PAYLOAD_PREFIX}${expiresAt}`)
    .digest("hex");
}

export function issueUploadTicket(now: number = Date.now()): string {
  const expiresAt = now + TICKET_TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyUploadTicket(
  ticket: string,
  now: number = Date.now()
): boolean {
  const separator = ticket.indexOf(".");
  if (separator <= 0) return false;

  const expiresAt = Number(ticket.slice(0, separator));
  const signature = ticket.slice(separator + 1);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < now) return false;

  const expected = Buffer.from(sign(expiresAt), "hex");
  const provided = Buffer.from(signature, "hex");
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}
