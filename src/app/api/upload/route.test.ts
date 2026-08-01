// @vitest-environment node
// jsdom's File is not the one undici hands back from Request.formData(), so the
// route's `instanceof File` check fails there for reasons unrelated to the code.
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test-token" },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({ url: "https://store.public.blob.vercel-storage.com/x.jpg" }),
}));

// Magic-byte sniffing is covered by the e2e suite; keep this file on authorization.
vi.mock("file-type", () => ({
  fileTypeFromBuffer: vi.fn().mockResolvedValue({ mime: "image/jpeg", ext: "jpg" }),
}));

vi.mock("@/lib/db", () => ({
  db: { query: { parties: { findFirst: vi.fn() } } },
}));

const cookieStore = { get: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { issueUploadTicket } from "@/lib/auth/upload-ticket";
import { POST } from "./route";

const SLUG = "rue-jaboulay-lyon";
const ADMIN_TOKEN = "a".repeat(64);

// The route selects `columns: { adminToken: true }`, so the resolved row is a
// slice of Party — narrower than the mock's inferred return type.
const findFirst = db.query.parties.findFirst as unknown as ReturnType<typeof vi.fn>;

function request(fields: Record<string, string> = {}, withFile = true) {
  const body = new FormData();
  if (withFile) {
    body.append("file", new File([new Uint8Array(16)], "cover.jpg", { type: "image/jpeg" }));
  }
  for (const [key, value] of Object.entries(fields)) {
    body.append(key, value);
  }
  return new Request("http://localhost/api/upload", { method: "POST", body });
}

function givenAdminCookie(token: string | null) {
  cookieStore.get.mockImplementation((name: string) =>
    name === `vp_admin_${SLUG}` && token ? { value: token } : undefined
  );
}

describe("POST /api/upload authorization", () => {
  beforeEach(() => {
    findFirst.mockReset();
    cookieStore.get.mockReset();
    vi.mocked(put).mockClear();
  });

  it("rejects an anonymous upload without touching the Blob store", async () => {
    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(put).not.toHaveBeenCalled();
  });

  it("accepts a valid signed ticket (create flow)", async () => {
    const response = await POST(request({ ticket: issueUploadTicket() }));

    expect(response.status).toBe(200);
    expect(put).toHaveBeenCalledTimes(1);
  });

  it("rejects an expired ticket", async () => {
    const expired = issueUploadTicket(Date.now() - 60 * 60 * 1000);

    const response = await POST(request({ ticket: expired }));

    expect(response.status).toBe(401);
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects a forged ticket", async () => {
    const response = await POST(request({ ticket: `${Date.now() + 60_000}.deadbeef` }));

    expect(response.status).toBe(401);
    expect(put).not.toHaveBeenCalled();
  });

  it("accepts a slug backed by the matching admin cookie (edit flow)", async () => {
    givenAdminCookie(ADMIN_TOKEN);
    findFirst.mockResolvedValue({ adminToken: ADMIN_TOKEN });

    const response = await POST(request({ slug: SLUG }));

    expect(response.status).toBe(200);
    expect(put).toHaveBeenCalledTimes(1);
  });

  it("rejects a slug whose cookie holds another party's token", async () => {
    givenAdminCookie("b".repeat(64));
    findFirst.mockResolvedValue({ adminToken: ADMIN_TOKEN });

    const response = await POST(request({ slug: SLUG }));

    expect(response.status).toBe(401);
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects a slug with no admin cookie at all", async () => {
    givenAdminCookie(null);

    const response = await POST(request({ slug: SLUG }));

    expect(response.status).toBe(401);
    expect(findFirst).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects a slug that does not exist", async () => {
    givenAdminCookie(ADMIN_TOKEN);
    findFirst.mockResolvedValue(undefined);

    const response = await POST(request({ slug: SLUG }));

    expect(response.status).toBe(401);
    expect(put).not.toHaveBeenCalled();
  });

  it("checks credentials before the file itself", async () => {
    const response = await POST(request({}, false));

    expect(response.status).toBe(401);
  });
});
