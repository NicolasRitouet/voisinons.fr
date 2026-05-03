"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onUploaded: (url: string) => void;
  onError: (msg: string) => void;
}

export function CoverImageUpload({ onUploaded, onError }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
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
