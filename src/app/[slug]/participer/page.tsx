import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPartyBySlug } from "@/lib/actions/party";
import { getPanoramaxImage } from "@/lib/panoramax";
import { PartyHeader } from "@/components/party/party-header";
import { PartyInfo } from "@/components/party/party-info";
import { PartyNeeds } from "@/components/party/party-needs";
import { JoinPartyForm } from "@/components/party/join-party-form";
import { mergeNeedsWithDefaults } from "@/lib/needs";

export const dynamic = "force-dynamic";

interface PartyJoinPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PartyJoinPageProps): Promise<Metadata> {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);

  if (!party) {
    return {
      title: "Participation introuvable | Voisinons.fr",
    };
  }

  return {
    title: `Participer à ${party.name} | Voisinons.fr`,
    description: party.description || `Inscrivez-vous à "${party.name}".`,
    robots: { index: false, follow: false },
  };
}

export default async function PartyJoinPage({ params }: PartyJoinPageProps) {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);

  if (!party) {
    notFound();
  }

  const needsWithDefaults = mergeNeedsWithDefaults(party.needs);

  let coverImage: string | null = party.coverImageUrl || null;
  let coverImageSource: "custom" | "panoramax" | null = coverImage ? "custom" : null;

  if (!coverImage && party.latitude && party.longitude) {
    coverImage = await getPanoramaxImage(
      parseFloat(party.latitude),
      parseFloat(party.longitude)
    );
    coverImageSource = coverImage ? "panoramax" : null;
  }

  return (
    <main className="min-h-screen bg-neighbor-cream">
      <PartyHeader party={party} coverImage={coverImage} coverImageSource={coverImageSource} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <JoinPartyForm partyId={party.id} partySlug={party.slug} needs={needsWithDefaults} />
          </div>
          <div className="space-y-6">
            <PartyInfo party={party} />
            <PartyNeeds needs={needsWithDefaults} />
          </div>
        </div>
      </div>
    </main>
  );
}
