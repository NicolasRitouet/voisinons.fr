"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  joinParty,
  getParticipantById,
  updateParticipant,
} from "@/lib/actions/participant";

interface JoinPartyButtonProps {
  partyId: string;
  partySlug: string;
}

// Helper to get localStorage key for this party
function getStorageKey(partySlug: string) {
  return `voisinons_participant_${partySlug}`;
}

export function JoinPartyButton({ partyId, partySlug }: JoinPartyButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [bringing, setBringing] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [existingParticipantId, setExistingParticipantId] = useState<
    string | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  // Check localStorage for existing registration
  useEffect(() => {
    async function checkExistingRegistration() {
      const storedId = localStorage.getItem(getStorageKey(partySlug));

      if (storedId) {
        // Verify the participant still exists
        const participant = await getParticipantById(storedId);

        if (participant && participant.partyId === partyId) {
          setExistingParticipantId(storedId);
          setName(participant.name);
          setEmail(participant.email || "");
          setGuestCount(participant.guestCount);
          setBringing(participant.bringing || "");
        } else {
          // Participant not found or wrong party, clear storage
          localStorage.removeItem(getStorageKey(partySlug));
        }
      }

      setIsLoading(false);
    }

    checkExistingRegistration();
  }, [partyId, partySlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    startTransition(async () => {
      if (existingParticipantId) {
        // Update existing registration
        const result = await updateParticipant({
          participantId: existingParticipantId,
          name: name.trim(),
          email: email.trim() || undefined,
          guestCount,
          bringing: bringing.trim() || undefined,
        });

        if (result.success) {
          setSuccess(true);
          setIsEditMode(false);
          router.refresh();
        } else {
          setError(result.error || "Une erreur est survenue");
        }
      } else {
        // New registration
        const result = await joinParty({
          partyId,
          name: name.trim(),
          email: email.trim() || undefined,
          guestCount,
          bringing: bringing.trim() || undefined,
        });

        if (result.success && result.participantId) {
          // Store participant ID in localStorage
          localStorage.setItem(getStorageKey(partySlug), result.participantId);
          setExistingParticipantId(result.participantId);
          setSuccess(true);
          router.refresh();
        } else {
          setError(
            ("error" in result && result.error) || "Une erreur est survenue"
          );
        }
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-neighbor-orange/5 border-neighbor-orange/20">
        <CardContent className="p-6">
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Success state after update
  if (success && existingParticipantId && !isEditMode) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">&#10004;</div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg text-green-800 mb-2">
            Inscription mise à jour !
          </h3>
          <p className="font-[family-name:var(--font-outfit)] text-green-600 text-sm mb-4">
            Vos modifications ont été enregistrées.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuccess(false);
              setIsEditMode(true);
              setShowForm(true);
            }}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Modifier à nouveau
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success state after initial registration
  if (success && !isEditMode) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">&#127881;</div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg text-green-800 mb-2">
            Vous êtes inscrit(e) !
          </h3>
          <p className="font-[family-name:var(--font-outfit)] text-green-600 text-sm mb-4">
            À bientôt pour la fête !
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuccess(false);
              setIsEditMode(true);
              setShowForm(true);
            }}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Modifier mon inscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Already registered - show status card
  if (existingParticipantId && !showForm) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-[family-name:var(--font-space-grotesk)] font-bold text-green-800">
                {name}
              </p>
              <p className="font-[family-name:var(--font-outfit)] text-green-600 text-sm">
                {guestCount > 1
                  ? `${guestCount} personnes`
                  : "1 personne"}
              </p>
            </div>
          </div>
          {bringing && (
            <p className="font-[family-name:var(--font-outfit)] text-green-700 text-sm mb-4 bg-green-100 rounded-lg p-2">
              <span className="font-medium">Apporte :</span> {bringing}
            </p>
          )}
          <Button
            onClick={() => {
              setShowForm(true);
              setIsEditMode(true);
            }}
            variant="outline"
            className="w-full border-green-300 text-green-700 hover:bg-green-100"
          >
            Modifier mon inscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not registered - show join button
  if (!showForm) {
    return (
      <Card className="bg-neighbor-orange/5 border-neighbor-orange/20">
        <CardContent className="p-6">
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-neighbor-orange hover:bg-neighbor-orange/90 text-white font-bold py-6 text-lg"
          >
            Je participe !
          </Button>
          <p className="font-[family-name:var(--font-outfit)] text-gray-500 text-xs text-center mt-3">
            Inscription rapide, sans création de compte
          </p>
        </CardContent>
      </Card>
    );
  }

  // Form (for both new registration and edit)
  return (
    <Card className="bg-white border-neighbor-orange/20">
      <CardHeader className="pb-4">
        <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-xl text-neighbor-stone">
          {isEditMode ? "Modifier mon inscription" : "Rejoindre la fête"}
        </CardTitle>
        <CardDescription className="font-[family-name:var(--font-outfit)]">
          {isEditMode
            ? "Mettez à jour vos informations"
            : "Renseignez vos informations pour participer"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Votre nom *</Label>
            <Input
              id="name"
              placeholder="ex: Marie Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Votre email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              placeholder="ex: marie@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Pour recevoir les rappels et informations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount">Nombre de personnes</Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              max={20}
              value={guestCount}
              onChange={(e) =>
                setGuestCount(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
            <p className="text-xs text-gray-500">Vous compris</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bringing">Qu&apos;apportez-vous ? (optionnel)</Label>
            <Textarea
              id="bringing"
              placeholder="ex: Une salade, des chaises, des boissons..."
              value={bringing}
              onChange={(e) => setBringing(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setIsEditMode(false);
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-neighbor-orange hover:bg-neighbor-orange/90"
              disabled={isPending}
            >
              {isPending
                ? isEditMode
                  ? "Mise à jour..."
                  : "Inscription..."
                : isEditMode
                  ? "Mettre à jour"
                  : "M'inscrire"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
