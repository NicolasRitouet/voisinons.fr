import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageHeader } from "@/components/landing/content-page-header";
import { Footer } from "@/components/landing/footer";

const PAGE_URL = "https://voisinons.fr/fete-des-voisins-2026";
const TITLE = "Fête des Voisins 2026 : date officielle, origine et comment l'organiser";
const DESCRIPTION =
  "Fête des Voisins 2026 : vendredi 29 mai. Date officielle, origine, conseils pratiques et outil gratuit pour créer votre affiche en 30 secondes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/fete-des-voisins-2026" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Fête des Voisins 2026",
  description:
    "Édition 2026 de la Fête des Voisins, événement national pour rencontrer ses voisins autour d'un repas partagé.",
  startDate: "2026-05-29T18:00:00+02:00",
  endDate: "2026-05-29T23:00:00+02:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Country",
    name: "France",
  },
  organizer: {
    "@type": "Organization",
    name: "Voisinons.fr",
    url: "https://voisinons.fr",
  },
  isAccessibleForFree: true,
  inLanguage: "fr-FR",
  url: PAGE_URL,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quand a lieu la Fête des Voisins 2026 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La Fête des Voisins 2026 a lieu le vendredi 29 mai 2026. Elle se tient traditionnellement le dernier vendredi du mois de mai.",
      },
    },
    {
      "@type": "Question",
      name: "Faut-il une autorisation pour organiser la Fête des Voisins ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pour une fête dans le hall ou la cour d'un immeuble, prévenez simplement le syndic. Pour une fête en extérieur sur la voie publique, une demande à la mairie est nécessaire (gratuite, à faire 2 à 4 semaines avant).",
      },
    },
    {
      "@type": "Question",
      name: "La Fête des Voisins est-elle gratuite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, c'est un événement gratuit basé sur le partage. Chaque voisin apporte un plat ou une boisson. De nombreuses mairies proposent un kit gratuit (gobelets, ballons, affiches).",
      },
    },
    {
      "@type": "Question",
      name: "Comment inviter ses voisins à la fête ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez créer une affiche à imprimer pour le hall d'immeuble, glisser des invitations dans les boîtes aux lettres, ou utiliser un outil comme Voisinons.fr qui génère une page web et une affiche PDF avec QR code en 30 secondes.",
      },
    },
    {
      "@type": "Question",
      name: "Que faire si la Fête des Voisins tombe sous la pluie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prévoyez un plan B dès l'organisation : hall d'immeuble, salle commune, garage couvert, ou décalage en intérieur chez un voisin volontaire. Mentionnez le plan B sur l'affiche pour rassurer les participants.",
      },
    },
  ],
};

export default function FeteDesVoisins2026Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ContentPageHeader />
      <main className="bg-neighbor-cream">
        <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-3xl mx-auto">
            <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-widest text-neighbor-orange font-bold mb-4">
              Édition 2026
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-neighbor-stone mb-6">
              Fête des Voisins 2026 : <span className="text-neighbor-orange">vendredi 29 mai</span>
            </h1>
            <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-700 leading-relaxed">
              La 27ème édition de la Fête des Voisins se tiendra le{" "}
              <strong>vendredi 29 mai 2026</strong>. Une soirée pour rencontrer ses voisins, partager
              un repas et faire vivre son immeuble, sa rue ou son quartier.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neighbor-stone/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-wide text-gray-500 mb-2">
                  Date
                </p>
                <p className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone">
                  Vendredi 29 mai 2026
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-wide text-gray-500 mb-2">
                  Horaire conseillé
                </p>
                <p className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone">
                  18h00 — 23h00
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-wide text-gray-500 mb-2">
                  Lieu
                </p>
                <p className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone">
                  Partout en France
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/creer"
                className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-[family-name:var(--font-outfit)] font-bold hover:bg-neighbor-stone transition-colors"
              >
                Créer mon affiche pour le 29 mai
                <span aria-hidden>→</span>
              </Link>
              <p className="text-sm text-gray-500 mt-3 font-[family-name:var(--font-outfit)]">
                Page web + affiche PDF + QR code — gratuit, sans inscription
              </p>
            </div>
          </div>
        </section>

        <article className="px-4 py-12 prose-invert">
          <div className="max-w-3xl mx-auto space-y-12 font-[family-name:var(--font-outfit)] text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Pourquoi le 29 mai 2026 ?
              </h2>
              <p className="text-lg">
                La Fête des Voisins se tient depuis 1999 chaque année à la fin du mois de mai.
                Concrètement, la date officielle nationale tombe le{" "}
                <strong>dernier vendredi de mai</strong>, ou le premier vendredi de juin selon les
                années. En 2026, ce sera donc le <strong>vendredi 29 mai</strong>.
              </p>
              <p className="text-lg mt-4">
                Vous n&apos;êtes pas obligé d&apos;organiser votre fête exactement ce jour-là. Si la
                date ne vous convient pas (météo, indisponibilité d&apos;un voisin clé, week-end de
                Pentecôte&hellip;), vous pouvez la décaler d&apos;une ou deux semaines sans
                problème. L&apos;essentiel, c&apos;est qu&apos;elle ait lieu.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                D&apos;où vient la Fête des Voisins ?
              </h2>
              <p className="text-lg">
                L&apos;événement a été lancé en 1999 dans le 17ème arrondissement de Paris à
                l&apos;initiative d&apos;Atanase Périfan, alors élu local, après la découverte
                d&apos;une voisine décédée seule dans son appartement plusieurs mois auparavant.
                Le constat : on ne se connaît plus dans nos immeubles. La Fête des Voisins a
                été pensée comme un prétexte simple — un apéritif partagé — pour briser cette
                solitude urbaine.
              </p>
              <p className="text-lg mt-4">
                Plus de 25 ans plus tard, l&apos;événement rassemble plus de{" "}
                <strong>10 millions de participants</strong> en France et a essaimé dans 36 pays
                sous le nom <em>European Neighbours&apos; Day</em>.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Comment organiser la Fête des Voisins 2026 ?
              </h2>
              <p className="text-lg">
                La meilleure approche est la plus simple. Voici la version courte :
              </p>
              <ol className="list-decimal list-inside space-y-3 mt-4 text-lg">
                <li>
                  <strong>Choisissez le lieu</strong> : hall d&apos;immeuble, cour, rue
                  pavillonnaire, square. Si c&apos;est sur la voie publique, prévenez la mairie
                  2 à 4 semaines avant.
                </li>
                <li>
                  <strong>Préparez une affiche</strong> indiquant date, heure, lieu et le principe
                  &laquo;&nbsp;chacun apporte un plat à partager&nbsp;&raquo;. Affichez-la dans le
                  hall et glissez des invitations dans les boîtes aux lettres.
                </li>
                <li>
                  <strong>Coordonnez les apports</strong> : un fichier partagé, un groupe WhatsApp,
                  ou une page web type Voisinons.fr évitent les doublons (5 quiches, zéro boisson).
                </li>
                <li>
                  <strong>Le jour J</strong> : tables dépliantes, gobelets, petite enceinte,
                  ambiance simple. Pas besoin de surproduction, le but c&apos;est de discuter.
                </li>
              </ol>
              <p className="text-lg mt-4">
                <Link
                  href="/guide-fete-des-voisins-2026"
                  className="text-neighbor-orange font-bold hover:underline"
                >
                  Voir le guide complet en 7 étapes →
                </Link>
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Que demander à sa mairie ?
              </h2>
              <p className="text-lg">
                La plupart des communes mettent à disposition un &laquo;&nbsp;kit Fête des
                Voisins&nbsp;&raquo; gratuit qui comprend selon les villes : affiches officielles,
                ballons, t-shirts, gobelets, sets de table. Beaucoup prêtent également des barrières,
                tables et bancs si vous fermez une portion de rue. Il suffit généralement
                d&apos;envoyer un email au service vie de quartier ou démocratie locale en avril.
              </p>
            </section>

            <section className="bg-neighbor-stone text-white rounded-3xl p-8 md:p-12">
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl mb-4">
                Lancez votre Fête des Voisins 2026 en 30 secondes
              </h2>
              <p className="text-lg text-white/85 mb-6 max-w-xl">
                Voisinons.fr génère votre page web personnalisée, votre affiche PDF imprimable
                avec QR code, et coordonne automatiquement les plats apportés par chaque voisin.
                Sans inscription, sans tracking, suppression automatique 30 jours après
                l&apos;événement.
              </p>
              <Link
                href="/creer"
                className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-bold hover:bg-neighbor-yellow hover:text-neighbor-stone transition-colors"
              >
                Créer ma fête maintenant
                <span aria-hidden>→</span>
              </Link>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-6">
                Questions fréquentes
              </h2>
              <div className="space-y-6">
                {faqJsonLd.mainEntity.map((qa) => (
                  <div key={qa.name}>
                    <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-2">
                      {qa.name}
                    </h3>
                    <p className="text-lg">{qa.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Et après 2026 ?
              </h2>
              <p className="text-lg">
                Pour information, les prochaines éditions sont prévues le{" "}
                <strong>vendredi 28 mai 2027</strong>, le <strong>vendredi 26 mai 2028</strong> et
                le <strong>vendredi 25 mai 2029</strong>. Notez-les dès maintenant dans votre
                agenda — c&apos;est plus facile de garder une régularité quand la date est connue
                à l&apos;avance.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
