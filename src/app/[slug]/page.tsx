import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPartyBySlug } from "@/lib/actions/party";
import { getPanoramaxImage } from "@/lib/panoramax";
import { PartyHeader } from "@/components/party/party-header";
import { PartyInfo } from "@/components/party/party-info";
import { ParticipantsList } from "@/components/party/participants-list";
import { JoinPartyButton } from "@/components/party/join-party-button";
import { PartyUpdates } from "@/components/party/party-updates";
import { AdminEditButton } from "@/components/party/admin-edit-button";
import { PartyChannels } from "@/components/party/party-channels";
import { PartyNeeds } from "@/components/party/party-needs";
import { mergeNeedsWithDefaults } from "@/lib/needs";

// Force dynamic rendering (requires DB access)
export const dynamic = "force-dynamic";

interface PartyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PartyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const party = await getPartyBySlug(slug);

  if (!party) {
    return {
      title: "Fête non trouvée | Voisinons.fr",
    };
  }

  return {
    title: `${party.name} | Voisinons.fr`,
    description: party.description || `Rejoignez la fête "${party.name}" !`,
    openGraph: {
      title: party.name,
      description: party.description || `Rejoignez la fête "${party.name}" !`,
      type: "website",
    },
  };
}

export default async function PartyPage({ params }: PartyPageProps) {
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
      <AdminEditButton slug={slug} />
      <PartyHeader party={party} coverImage={coverImage} coverImageSource={coverImageSource} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <PartyInfo party={party} />

            {party.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
                  À propos
                </h2>
                <div className="font-[family-name:var(--font-outfit)] text-gray-600 whitespace-pre-wrap">
                  {party.description}
                </div>
              </div>
            )}

            {party.updates && party.updates.length > 0 && (
              <PartyUpdates updates={party.updates} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <JoinPartyButton partySlug={party.slug} />
            <ParticipantsList participants={party.participants} />
            <PartyNeeds needs={needsWithDefaults} />
            <PartyChannels channels={party.discussionChannels} />
          </div>
        </div>
      </div>
    </main>
  );
}
