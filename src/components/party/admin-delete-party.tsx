"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteParty } from "@/lib/actions/party";

interface AdminDeletePartyProps {
  partyId: string;
  partyName: string;
  token: string;
}

export function AdminDeletePartyForm({
  partyId,
  partyName,
  token,
}: AdminDeletePartyProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteParty({ partyId, token });

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error?._form?.[0] ?? "Une erreur est survenue");
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(true)}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Supprimer la fête et toutes les données
        </Button>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">
        Supprimer <strong>{partyName}</strong> effacera définitivement la page,
        la liste des participants et leurs coordonnées. Cette action est
        irréversible.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          {isPending ? "Suppression…" : "Oui, tout supprimer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
