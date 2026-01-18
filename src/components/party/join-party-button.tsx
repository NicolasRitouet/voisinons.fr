"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getParticipantIdKey,
  getParticipantTokenKey,
} from "@/lib/storage/participant";

interface JoinPartyButtonProps {
  partySlug: string;
}

export function JoinPartyButton({ partySlug }: JoinPartyButtonProps) {
  const [hasRegistration, setHasRegistration] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("participantToken");
    if (tokenFromUrl) {
      localStorage.setItem(getParticipantTokenKey(partySlug), tokenFromUrl);
      router.replace(`/${partySlug}/participer?participantToken=${tokenFromUrl}`);
      return;
    }

    const storedToken = localStorage.getItem(getParticipantTokenKey(partySlug));
    const storedId = localStorage.getItem(getParticipantIdKey(partySlug));
    setHasRegistration(Boolean(storedToken || storedId));
  }, [partySlug, router, searchParams]);

  const primaryLabel = hasRegistration
    ? "Modifier ma participation"
    : "Je participe !";

  const helperText = hasRegistration
    ? "Vous pouvez mettre à jour vos informations à tout moment."
    : "Inscription rapide, sans création de compte";

  return (
    <Card className="bg-neighbor-orange/5 border-neighbor-orange/20">
      <CardContent className="p-6">
        <Button
          asChild
          className="w-full bg-neighbor-orange hover:bg-neighbor-orange/90 text-white font-bold py-6 text-lg"
        >
          <Link href={`/${partySlug}/participer`}>{primaryLabel}</Link>
        </Button>
        <p className="font-[family-name:var(--font-outfit)] text-gray-500 text-xs text-center mt-3">
          {helperText}
        </p>
      </CardContent>
    </Card>
  );
}
