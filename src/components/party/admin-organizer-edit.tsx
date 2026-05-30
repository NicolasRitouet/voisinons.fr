"use client";

import { useState, useTransition } from "react";
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
import { adminUpdateOrganizerParticipant } from "@/lib/actions/participant";

interface AdminOrganizerEditProps {
  partyId: string;
  token: string;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultGuestCount: number;
  defaultBringing: string;
}

export function AdminOrganizerEdit({
  partyId,
  token,
  defaultName,
  defaultEmail,
  defaultPhone,
  defaultGuestCount,
  defaultBringing,
}: AdminOrganizerEditProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [guestCount, setGuestCount] = useState(defaultGuestCount);
  const [bringing, setBringing] = useState(defaultBringing);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateOrganizerParticipant({
        partyId,
        token,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        guestCount,
        bringing: bringing.trim() || undefined,
      });

      if (result.success) {
        setSuccessMessage("Votre participation a été mise à jour.");
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <Card className="bg-white border-neighbor-orange/20">
      <CardHeader className="pb-4">
        <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-xl text-neighbor-stone">
          Ma participation
        </CardTitle>
        <CardDescription className="font-[family-name:var(--font-outfit)]">
          En tant qu&apos;organisateur, ajustez vos informations et le nombre de
          personnes que vous comptez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizer-name">Votre nom *</Label>
            <Input
              id="organizer-name"
              placeholder="ex: Marie Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer-email">Votre email (optionnel)</Label>
            <Input
              id="organizer-email"
              type="email"
              placeholder="ex: marie@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer-phone">Votre téléphone (optionnel)</Label>
            <Input
              id="organizer-phone"
              type="tel"
              placeholder="ex: 0612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer-guest-count">Nombre de personnes</Label>
            <Input
              id="organizer-guest-count"
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
            <Label htmlFor="organizer-bringing">
              Qu&apos;apportez-vous ? (optionnel)
            </Label>
            <Textarea
              id="organizer-bringing"
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

          {successMessage && (
            <p className="text-green-700 text-sm bg-green-50 p-3 rounded-lg">
              {successMessage}
            </p>
          )}

          <Button
            type="submit"
            className="bg-neighbor-orange hover:bg-neighbor-orange/90"
            disabled={isPending}
          >
            {isPending ? "Mise à jour..." : "Mettre à jour ma participation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
