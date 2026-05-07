import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import type { Party } from "@/lib/db/schema";
import { placeTypeLabels } from "@/lib/validations/party";

interface PartyHeaderProps {
  party: Pick<Party, "name" | "address" | "placeType" | "dateStart">;
  coverImage?: string | null;
  coverImageSource?: "custom" | "panoramax" | null;
}

const placeTypeIcons: Record<string, string> = {
  rue: "&#128739;",
  impasse: "&#128739;",
  residence: "&#127970;",
  parc: "&#127795;",
  place: "&#127747;",
  autre: "&#127881;",
};

export function PartyHeader({
  party,
  coverImage,
  coverImageSource,
}: PartyHeaderProps) {
  const formattedDate = format(new Date(party.dateStart), "EEEE d MMMM yyyy", {
    locale: fr,
  });
  const formattedTime = format(new Date(party.dateStart), "HH:mm", {
    locale: fr,
  });

  const placeTypeKey = party.placeType as keyof typeof placeTypeLabels;

  return (
    <header className="relative bg-neighbor-stone text-white overflow-hidden">
      {/* Background image from Panoramax */}
      {coverImage && (
        <>
          {coverImageSource === "custom" ? (
            <img
              src={coverImage}
              alt={`Illustration de ${party.name}`}
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            />
          ) : (
            <Image
              src={coverImage}
              alt={`Vue de ${party.address}`}
              fill
              className="object-cover opacity-55"
              priority
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neighbor-stone/85 via-neighbor-stone/60 to-neighbor-stone/30" />
        </>
      )}

      {/* Background decoration (fallback if no image) */}
      {!coverImage && (
        <>
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-neighbor-orange rounded-full filter blur-[100px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-neighbor-yellow rounded-full filter blur-[120px] opacity-20" />
        </>
      )}

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-neighbor-orange rounded-full flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl tracking-tight">
            voisinons<span className="text-neighbor-orange">.fr</span>
          </span>
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-2xl"
            dangerouslySetInnerHTML={{
              __html: placeTypeIcons[party.placeType] || "&#127881;",
            }}
          />
          <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm font-medium">
            {placeTypeLabels[placeTypeKey] || "Autre"}
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl sm:text-4xl md:text-6xl mb-6">
          {party.name}
        </h1>

        <div className="flex flex-wrap gap-6 font-[family-name:var(--font-outfit)] text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">&#128197;</span>
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">&#128337;</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">&#128205;</span>
            <span className="break-words">{party.address}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
