"use server";

import { issueUploadTicket } from "@/lib/auth/upload-ticket";

/**
 * Hands out a short-lived upload permit for the create-party flow, where no
 * party — and therefore no adminToken — exists yet.
 *
 * This is a speed bump, not authorization: anyone can call a Server Action, so
 * it only forces abuse through our own origin instead of a bare curl. The
 * durable control on this path is the rate limit (see the rate-limiting task).
 * Edits go through the admin cookie instead, which is real authorization.
 */
export async function createUploadTicket(): Promise<string> {
  return issueUploadTicket();
}
