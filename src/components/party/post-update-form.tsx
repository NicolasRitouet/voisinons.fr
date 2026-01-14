"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPartyUpdate } from "@/lib/actions/party";

interface PostUpdateFormProps {
  partyId: string;
  token: string;
}

export function PostUpdateForm({ partyId, token }: PostUpdateFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Le message ne peut pas être vide");
      return;
    }

    startTransition(async () => {
      const result = await createPartyUpdate(partyId, token, content.trim());

      if (result.success) {
        setContent("");
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
          Publier une actualité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Informez vos voisins des dernières nouvelles..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <Button
            type="submit"
            className="bg-neighbor-orange hover:bg-neighbor-orange/90"
            disabled={isPending}
          >
            {isPending ? "Publication..." : "Publier"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
