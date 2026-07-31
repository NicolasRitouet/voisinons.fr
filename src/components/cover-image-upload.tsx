"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createUploadTicket } from "@/lib/actions/upload";

interface Props {
  onUploaded: (url: string) => void;
  onError: (msg: string) => void;
  /** Set when editing an existing party: authorizes via the admin cookie. */
  partySlug?: string;
}

const MAX_BYTES = 4 * 1024 * 1024;
const TOO_LARGE_MESSAGE = "Image trop volumineuse (4 Mo max). Pensez à la compresser avant de la téléverser.";

export function CoverImageUpload({ onUploaded, onError, partySlug }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      onError(TOO_LARGE_MESSAGE);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (partySlug) {
        formData.append("slug", partySlug);
      } else {
        formData.append("ticket", await createUploadTicket());
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.status === 413) {
        throw new Error(TOO_LARGE_MESSAGE);
      }
      const data = await res
        .json()
        .catch(() => ({}) as { url?: string; error?: string });
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erreur d'upload");
      }
      onUploaded(data.url);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-neighbor-stone text-white hover:bg-neighbor-orange"
      >
        {uploading ? "Envoi en cours…" : "Choisir une image"}
      </Button>
    </>
  );
}
