"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminMessageTemplatesProps {
  partyName: string;
  publicUrl: string;
  formattedDate: string;
  timeLabel: string;
  address: string;
}

type Template = {
  id: string;
  title: string;
  body: string;
};

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

export function AdminMessageTemplates({
  partyName,
  publicUrl,
  formattedDate,
  timeLabel,
  address,
}: AdminMessageTemplatesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: "invite",
      title: "Invitation",
      body: `Bonjour ! On organise une fête des voisins "${partyName}" le ${formattedDate} à ${timeLabel} au ${address}.\n\nVous êtes les bienvenus :)\nInscription ici : ${publicUrl}`,
    },
    {
      id: "reminder",
      title: "Rappel (J-1)",
      body: `Petit rappel : la fête des voisins "${partyName}" a lieu demain à ${timeLabel} au ${address}.\n\nInfos et inscription : ${publicUrl}`,
    },
    {
      id: "lastminute",
      title: "Dernière minute",
      body: `Info de dernière minute : la fête "${partyName}" a lieu à ${address}, début à ${timeLabel}.\n\nSi vous venez, inscrivez-vous ici : ${publicUrl}`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
          Messages prêts à copier
        </CardTitle>
        <p className="text-sm text-gray-600">
          Copiez/collez ces messages dans vos SMS ou WhatsApp.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {templates.map((template) => (
          <div key={template.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neighbor-stone">
                {template.title}
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const ok = await copyToClipboard(template.body);
                  if (ok) {
                    setCopiedId(template.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }
                }}
              >
                {copiedId === template.id ? "Copié !" : "Copier"}
              </Button>
            </div>
            <Textarea
              value={template.body}
              readOnly
              rows={4}
              className="text-sm"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
