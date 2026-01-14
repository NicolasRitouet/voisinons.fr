import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getPartyForAdmin } from "@/lib/actions/party";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostUpdateForm } from "@/components/party/post-update-form";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({
  params,
}: AdminPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Admin - ${slug} | Voisinons.fr`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect(`/${slug}`);
  }

  const party = await getPartyForAdmin(slug, token);

  if (!party) {
    notFound();
  }

  const formattedDate = format(new Date(party.dateStart), "EEEE d MMMM yyyy 'à' HH:mm", {
    locale: fr,
  });

  const totalGuests = party.participants.reduce((sum, p) => sum + (p.guestCount || 1), 0);

  return (
    <main className="min-h-screen bg-neighbor-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="text-neighbor-stone hover:text-neighbor-orange transition-colors text-sm font-medium"
          >
            &larr; Voir la page publique
          </Link>
          <span className="bg-neighbor-orange text-white text-xs font-bold px-3 py-1 rounded-full">
            Mode Admin
          </span>
        </div>

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-2">
            {party.name}
          </h1>
          <p className="text-gray-600 font-[family-name:var(--font-outfit)]">
            {formattedDate}
          </p>
        </div>

        <div className="mb-8">
          <Button asChild className="bg-neighbor-orange hover:bg-neighbor-orange/90">
            <a href={`/api/party/${party.slug}/poster?token=${token}`} download>
              Télécharger l&apos;affiche PDF
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neighbor-stone">{party.participants.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Personnes attendues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neighbor-orange">{totalGuests}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
              Liste des participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {party.participants.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun participant pour le moment</p>
            ) : (
              <div className="divide-y">
                {party.participants.map((participant) => (
                  <div key={participant.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neighbor-stone">
                          {participant.name}
                          {participant.isOrganizer && (
                            <span className="ml-2 text-xs bg-neighbor-orange text-white px-2 py-0.5 rounded-full">
                              Organisateur
                            </span>
                          )}
                        </p>
                        {participant.email && (
                          <p className="text-sm text-gray-500">{participant.email}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-neighbor-stone">
                        {participant.guestCount || 1} {(participant.guestCount || 1) > 1 ? "personnes" : "personne"}
                      </span>
                    </div>
                    {participant.bringing && (
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        Apporte : {participant.bringing}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8">
          <PostUpdateForm partyId={party.id} token={token} />
        </div>

        {party.updates && party.updates.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                Actualités publiées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {party.updates.map((update) => (
                  <div key={update.id} className="border-l-2 border-neighbor-orange pl-4 py-2">
                    <p className="text-gray-700">{update.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(update.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
              Informations de la fête
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Adresse</p>
              <p className="text-neighbor-stone">{party.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">URL publique</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                voisinons.fr/{party.slug}
              </code>
            </div>
            {party.isPrivate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Code d&apos;accès</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {party.accessCode}
                </code>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Organisateur</p>
              <p className="text-neighbor-stone">{party.organizerName} ({party.organizerEmail})</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
