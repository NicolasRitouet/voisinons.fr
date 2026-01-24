import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getPartyForAdmin } from "@/lib/actions/party";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostUpdateForm } from "@/components/party/post-update-form";
import { AdminMessageTemplates } from "@/components/party/admin-message-templates";
import { AdminCopyButtons } from "@/components/party/admin-copy-buttons";
import { AdminTabs, AdminTabPanel } from "@/components/party/admin-tabs";
import { AdminEditPartyForm } from "@/components/party/admin-edit-party-form";
import { AdminChannelForm } from "@/components/party/admin-channel-form";
import { AdminChannelList } from "@/components/party/admin-channel-list";
import { AdminNeeds } from "@/components/party/admin-needs";

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

  const dateStart = new Date(party.dateStart);
  const dateEnd = party.dateEnd ? new Date(party.dateEnd) : null;
  const formattedDate = format(dateStart, "EEEE d MMMM yyyy", { locale: fr });
  const timeStart = format(dateStart, "HH:mm", { locale: fr });
  const timeLabel = dateEnd
    ? `${timeStart} - ${format(dateEnd, "HH:mm", { locale: fr })}`
    : timeStart;
  const defaultLatitude = party.latitude ? parseFloat(party.latitude) : undefined;
  const defaultLongitude = party.longitude ? parseFloat(party.longitude) : undefined;

  // Single iteration over participants instead of 4 separate passes
  let totalGuests = 0;
  const emailsList: string[] = [];
  const phonesList: string[] = [];
  const contributionsList: string[] = [];

  for (const p of party.participants) {
    totalGuests += p.guestCount || 1;
    if (p.email) emailsList.push(p.email);
    if (p.phone) phonesList.push(p.phone);
    if (p.bringing) contributionsList.push(`${p.name}: ${p.bringing}`);
  }

  const emails = emailsList.join(", ");
  const phones = phonesList.join(", ");
  const contributions = contributionsList.join("\n");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://voisinons.fr";
  const publicUrl = `${appUrl}/${party.slug}`;
  const adminUrl = `${appUrl}/${party.slug}/admin?token=${token}`;

  return (
    <main className="min-h-screen bg-neighbor-cream">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
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

          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone">
              {party.name}
            </h1>
            <p className="text-gray-600 font-[family-name:var(--font-outfit)]">
              {formattedDate} · {timeLabel}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="resume">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                Caractéristiques de la fête
              </CardTitle>
              <p className="text-sm text-gray-600">
                Date, heure et lieu sont affichés clairement pour éviter les erreurs.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-neighbor-stone font-medium capitalize">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horaire</p>
                  <p className="text-neighbor-stone font-medium">{timeLabel}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="text-neighbor-stone font-medium">{party.address}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-neighbor-orange hover:bg-neighbor-orange/90">
                  <a href={`/api/party/${party.slug}/poster?token=${token}`} download>
                    Télécharger l&apos;affiche PDF
                  </a>
                </Button>
                <AdminEditPartyForm
                  partyId={party.id}
                  token={token}
                  defaultDate={new Date(party.dateStart).toISOString()}
                  defaultTimeStart={timeStart}
                  defaultTimeEnd={dateEnd ? format(dateEnd, "HH:mm", { locale: fr }) : null}
                  defaultAddress={party.address}
                  defaultCoverImageUrl={party.coverImageUrl}
                  defaultLatitude={defaultLatitude}
                  defaultLongitude={defaultLongitude}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                Statistiques rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Inscrits</span>
                <span className="text-2xl font-bold text-neighbor-stone">
                  {party.participants.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Personnes attendues</span>
                <span className="text-2xl font-bold text-neighbor-orange">
                  {totalGuests}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                URL publique :
                <div className="break-all bg-gray-50 p-2 rounded mt-1 text-neighbor-stone">
                  {publicUrl}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Lien admin :
                <div className="break-all bg-gray-50 p-2 rounded mt-1 text-neighbor-stone">
                  {adminUrl}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <AdminTabs
            tabs={[
              { id: "participants", label: "👥 Participants" },
              { id: "apports", label: "🎁 Contribution" },
              { id: "messages", label: "💬 Messages" },
              { id: "canaux", label: "📣 Canaux" },
              { id: "actualites", label: "📰 Actualités" },
            ]}
            defaultTabId="participants"
          >
            <AdminTabPanel id="participants">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                    Participants (détails)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Tout ce qu&apos;il faut pour contacter ou organiser les apports.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-neighbor-green/10 text-neighbor-green"
                    >
                      {totalGuests} {totalGuests > 1 ? "personnes" : "personne"}
                    </Badge>
                    {party.isPrivate && (
                      <Badge className="bg-neighbor-stone text-white">Fête privée</Badge>
                    )}
                  </div>

                  <AdminCopyButtons
                    emails={emails}
                    phones={phones}
                    contributions={contributions}
                  />

                  {party.participants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Aucun participant pour le moment
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {party.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm"
                        >
                          <div className="md:col-span-1">
                            <p className="text-gray-500">Nom</p>
                            <p className="text-neighbor-stone font-medium">
                              {participant.name}
                              {participant.isOrganizer && (
                                <span className="ml-2 text-xs bg-neighbor-orange text-white px-2 py-0.5 rounded-full">
                                  Organisateur
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="text-neighbor-stone">
                              {participant.email || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Téléphone</p>
                            <p className="text-neighbor-stone">
                              {participant.phone || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Nb de personnes</p>
                            <p className="text-neighbor-stone font-medium">
                              {participant.guestCount || 1}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Apporte</p>
                            <p className="text-neighbor-stone">
                              {participant.bringing || "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AdminTabPanel>

            <AdminTabPanel id="messages">
              <AdminMessageTemplates
                partyName={party.name}
                publicUrl={publicUrl}
                formattedDate={formattedDate}
                timeLabel={timeLabel}
                address={party.address}
              />
            </AdminTabPanel>

            <AdminTabPanel id="apports">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                    Catégories à apporter
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Proposez des catégories par défaut et ajoutez vos propres idées.
                  </p>
                </CardHeader>
                <CardContent>
                  <AdminNeeds partyId={party.id} token={token} needs={party.needs} />
                </CardContent>
              </Card>
            </AdminTabPanel>

            <AdminTabPanel id="canaux">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                    Canal de communication (public)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Ajoutez un lien vers un groupe WhatsApp, Signal, etc.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AdminChannelForm partyId={party.id} token={token} />
                  <AdminChannelList channels={party.discussionChannels} token={token} />
                </CardContent>
              </Card>
            </AdminTabPanel>

            <AdminTabPanel id="actualites">
              <PostUpdateForm partyId={party.id} token={token} />

              {party.updates && party.updates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                      Actualités publiées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {party.updates.map((update) => (
                        <div
                          key={update.id}
                          className="border-l-2 border-neighbor-orange pl-4 py-2"
                        >
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {update.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(update.createdAt), "d MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </AdminTabPanel>
          </AdminTabs>
        </section>
      </div>
    </main>
  );
}
