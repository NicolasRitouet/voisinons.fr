"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminDeleteParticipant } from "@/lib/actions/participant";

interface AdminDeleteParticipantProps {
  partyId: string;
  participantId: string;
  participantName: string;
  token: string;
}

export function AdminDeleteParticipant({
  partyId,
  participantId,
  participantName,
  token,
}: AdminDeleteParticipantProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // isPending drops before the refreshed list arrives, so without this latch a
  // second click hits an already-deleted row and reports a false failure.
  const [succeeded, setSucceeded] = useState(false);
  const messageId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasConfirming = useRef(false);

  // Focus lands on the panel, not on the confirm button: a native button fires
  // on keydown, so autofocusing it let a held Enter key skip the confirmation.
  useEffect(() => {
    if (confirming) {
      panelRef.current?.focus();
    } else if (wasConfirming.current) {
      triggerRef.current?.focus();
    }
    wasConfirming.current = confirming;
  }, [confirming]);

  function reset() {
    setError(null);
    setSucceeded(false);
    setConfirming(false);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await adminDeleteParticipant({
          partyId,
          participantId,
          token,
        });
      } catch (err) {
        // A rejected Server Action would otherwise reach the global error
        // boundary. Refresh anyway: the delete may well have committed.
        console.error("Delete participant action rejected:", err);
        setError("La suppression n'a pas pu aboutir. Vérifiez la liste.");
        router.refresh();
        return;
      }

      if (result.success) {
        setSucceeded(true);
      } else {
        setError(result.error ?? "Une erreur est survenue");
      }
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        aria-label={`Supprimer l'inscription de ${participantName}`}
        // Placement classes live here rather than on a wrapper: the component
        // is a direct grid child, so it can sit in the row's last column when
        // collapsed and span the full width once the panel opens.
        // hover:text-* is required too: the outline variant's own
        // hover:text-accent-foreground is white and would hide the label.
        className="self-center md:justify-self-end border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        Supprimer
      </Button>
    );
  }

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="group"
      aria-labelledby={messageId}
      className="md:col-span-6 md:justify-self-end max-w-md space-y-3 rounded-lg border border-red-200 bg-red-50 p-3"
    >
      <p id={messageId} className="text-sm text-red-900">
        Supprimer l&apos;inscription de <strong>{participantName}</strong> ? Les
        coordonnées et la contribution aux apports seront définitivement
        effacées. Cette action est irréversible.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleDelete}
          disabled={isPending || succeeded}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          {isPending || succeeded ? "Suppression…" : "Oui, supprimer"}
        </Button>
        {/* Never disabled: it is the way out if the refresh never lands. */}
        <Button type="button" size="sm" variant="outline" onClick={reset}>
          {succeeded ? "Fermer" : "Annuler"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
