import { put } from "@vercel/blob";
import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { getAdminTokenFromCookie } from "@/lib/auth/admin-session";
import { verifyUploadTicket } from "@/lib/auth/upload-ticket";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Two callers, two credentials:
 *  - editing an existing party → the httpOnly admin cookie for that slug,
 *  - creating one → a short-lived signed ticket, since no party exists yet.
 * Without either, this endpoint is free public Blob hosting on our account.
 */
async function isAuthorized(formData: FormData): Promise<boolean> {
  const slug = formData.get("slug");
  if (typeof slug === "string" && slug.length > 0) {
    const cookieToken = await getAdminTokenFromCookie(slug);
    if (!cookieToken) return false;

    const party = await db.query.parties.findFirst({
      where: eq(parties.slug, slug),
      columns: { adminToken: true },
    });
    return party !== undefined && party.adminToken === cookieToken;
  }

  const ticket = formData.get("ticket");
  return typeof ticket === "string" && verifyUploadTicket(ticket);
}

export async function POST(request: Request) {
  const formData = await request.formData();

  if (!(await isAuthorized(formData))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (4 Mo max)" },
      { status: 400 }
    );
  }

  // file.type is client-provided and trivially spoofable; ignore it and detect
  // the real format from the magic bytes instead.
  const buffer = new Uint8Array(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME.has(detected.mime)) {
    return NextResponse.json(
      { error: "Format non supporté (jpg, png, webp, gif uniquement)" },
      { status: 400 }
    );
  }

  const ext = MIME_TO_EXT[detected.mime];
  const pathname = `party-cover/${crypto.randomUUID()}.${ext}`;

  const blob = await put(pathname, Buffer.from(buffer), {
    access: "public",
    addRandomSuffix: false,
    contentType: detected.mime,
  });

  return NextResponse.json({ url: blob.url });
}
