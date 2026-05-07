"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NeedLike } from "@/lib/needs";
import { getNeedIcon, getNeedLabel } from "@/lib/needs";
import {
  joinParty,
  getParticipantByToken,
  updateParticipant,
} from "@/lib/actions/participant";
import {
  getParticipantToken,
  setParticipantToken,
  removeParticipantToken,
  removeParticipantId,
} from "@/lib/storage/participant";

interface JoinPartyFormProps {
  partyId: string;
  partySlug: string;
  needs: NeedLike[];
}

export function JoinPartyForm({ partyId, partySlug, needs }: JoinPartyFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [bringing, setBringing] = useState("");
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [participantTokenState, setParticipantTokenState] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const needsAvailable = needs && needs.length > 0;

  function resolveBringingText(): string | undefined {
    const trimmed = bringing.trim();
    if (!needsAvailable) {
      return trimmed || undefined;
    }

    const selectedNeed = selectedNeedId
      ? needs.find((need) => need.id === selectedNeedId)
      : null;
    if (!selectedNeed) {
      return trimmed || undefined;
    }

    const label = getNeedLabel(selectedNeed);
    return trimmed ? `${label} — ${trimmed}` : label;
  }

  function parseBringingFromText(text: string | null) {
    if (!text || !needsAvailable) return;
    for (const need of needs) {
      const label = getNeedLabel(need);
      if (text === label) {
        setSelectedNeedId(need.id);
        setBringing("");
        return;
      }
      if (text.startsWith(label)) {
        setSelectedNeedId(need.id);
        const remainder = text.slice(label.length).trim();
        const cleaned = remainder.replace(/^[:\-–—]\s*/, "");
        setBringing(cleaned);
        return;
      }
    }
  }

  useEffect(() => {
    async function checkExistingRegistration() {
      // Drop any legacy id-only entry — id alone is no longer accepted as proof
      // of ownership; only an editToken counts.
      removeParticipantId(partySlug);

      const tokenFromUrl = searchParams.get("participantToken");
      if (tokenFromUrl) {
        setParticipantToken(partySlug, tokenFromUrl);
        setParticipantTokenState(tokenFromUrl);
        router.replace(`/${partySlug}/participer`);
      }

      const storedToken = getParticipantToken(partySlug);

      if (storedToken) {
        const participant = await getParticipantByToken(storedToken);

        if (participant && participant.partyId === partyId) {
          setParticipantTokenState(storedToken);
          setName(participant.name);
          setEmail(participant.email || "");
          setPhone(participant.phone || "");
          setGuestCount(participant.guestCount);
          setBringing(participant.bringing || "");
          parseBringingFromText(participant.bringing || "");
          setIsEditMode(true);
        } else {
          removeParticipantToken(partySlug);
          setParticipantTokenState(null);
        }
      }

      setIsLoading(false);
    }

    checkExistingRegistration();
  }, [partyId, partySlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    startTransition(async () => {
      if (participantTokenState) {
        const result = await updateParticipant({
          editToken: participantTokenState,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          guestCount,
          bringing: resolveBringingText(),
        });

        if (result.success) {
          setSuccessMessage("Vos informations ont été mises à jour.");
          setIsEditMode(true);
          router.refresh();
        } else {
          setError(result.error || "Une erreur est survenue");
        }
      } else {
        const result = await joinParty({
          partyId,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          guestCount,
          bringing: resolveBringingText(),
        });

        if (result.success && result.participantId) {
          if ("editToken" in result && result.editToken) {
            setParticipantToken(partySlug, result.editToken);
            setParticipantTokenState(result.editToken);
          }
          setSuccessMessage("Merci ! Vous êtes bien inscrit(e).");
          setIsEditMode(true);
          router.refresh();
        } else {
          setError(("error" in result && result.error) || "Une erreur est survenue");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-neighbor-orange/20">
      <CardHeader className="pb-4">
        <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-xl text-neighbor-stone">
          {isEditMode ? "Modifier ma participation" : "Rejoindre la fête"}
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
              Visible uniquement par l&apos;organisateur pour vous tenir informé. Jamais pour de la pub.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Votre téléphone (optionnel)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="ex: 0612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Visible uniquement par l&apos;organisateur pour vous tenir informé si besoin. Jamais pour de la pub.
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
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="text-xs text-gray-500">Vous compris</p>
          </div>

          {needsAvailable ? (
            <>
              <div className="space-y-2">
                <Label>Catégorie à apporter (optionnel)</Label>
                <Select
                  value={selectedNeedId ?? ""}
                  onValueChange={(value) => {
                    setSelectedNeedId(value || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {needs.map((need) => (
                      <SelectItem key={need.id} value={need.id}>
                        {getNeedIcon(need)} {getNeedLabel(need)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bringing">Précision (optionnel)</Label>
                <Textarea
                  id="bringing"
                  placeholder="ex: Quiche, salade de pâtes, gobelets..."
                  value={bringing}
                  onChange={(e) => setBringing(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
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
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-green-700 text-sm bg-green-50 p-3 rounded-lg">
              {successMessage}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${partySlug}`)}
              className="flex-1"
            >
              Retour à la fête
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
