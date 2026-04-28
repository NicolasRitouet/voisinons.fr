"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / non-https — leave the user to select & copy manually
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-neighbor-stone text-white px-4 py-2 rounded-full font-[family-name:var(--font-outfit)] font-bold text-sm hover:bg-neighbor-orange transition-colors"
      aria-label={`${label} le texte`}
    >
      {copied ? "Copié ✓" : label}
    </button>
  );
}
