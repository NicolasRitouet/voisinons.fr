"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AdminCopyButtonsProps {
  emails: string;
  phones: string;
  contributions: string;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

export function AdminCopyButtons({ emails, phones, contributions }: AdminCopyButtonsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(kind: string, text: string) {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleCopy("emails", emails)}
        disabled={!emails}
      >
        {copied === "emails" ? "Emails copiés" : "Copier les emails"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleCopy("phones", phones)}
        disabled={!phones}
      >
        {copied === "phones" ? "Téléphones copiés" : "Copier les téléphones"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleCopy("contributions", contributions)}
        disabled={!contributions}
      >
        {copied === "contributions" ? "Liste copiée" : "Copier les apports"}
      </Button>
    </div>
  );
}
