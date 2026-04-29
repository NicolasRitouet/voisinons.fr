import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPageHeader } from "@/components/landing/content-page-header";
import { Footer } from "@/components/landing/footer";
import { MairieMailBlock } from "@/components/landing/mairie-mail-block";

const PAGE_URL = "https://voisinons.fr/kit-fete-des-voisins-2026";
const TITLE =
  "Kit Fête des Voisins 2026 : comment l'obtenir gratuitement et l'utiliser";
const DESCRIPTION =
  "Le kit officiel Voisins Solidaires est gratuit, téléchargeable directement, et regroupe affiches, flyers et sets de table. Voici ce qu'il contient, comment l'imprimer, et comment le compléter avec une affichette personnalisée à votre événement.";

const OFFICIAL_KIT_URL = "https://www.fetedesvoisins.fr/nos-kits-de-communication/";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/kit-fete-des-voisins-2026" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

const faqs = [
  {
    q: "Le kit Fête des Voisins 2026 est-il vraiment gratuit ?",
    a: "Oui. Le kit officiel proposé par l'association Voisins Solidaires (initiateur de la Fête des Voisins) est en téléchargement libre, sans inscription, sur le site officiel fetedesvoisins.fr. Aucune mairie, syndic ou organisateur n'a à payer pour l'utiliser.",
  },
  {
    q: "Faut-il commander un kit physique par courrier ?",
    a: "Non. Le kit national est numérique : on télécharge des fichiers et on imprime soi-même (ou on fait imprimer chez un copy-shop). Certaines mairies distribuent en complément un kit physique (gobelets, ballons, t-shirts) — renseignez-vous auprès du service vie de quartier de votre commune.",
  },
  {
    q: "Pourquoi le kit officiel propose-t-il du format InDesign ?",
    a: "Pour permettre aux services communication des mairies, syndics et copropriétés de personnaliser les visuels avec leur identité locale (logo, couleurs). Les particuliers et organisateurs sans logiciel graphique utiliseront simplement le PDF national prêt à imprimer, également inclus dans le kit.",
  },
  {
    q: "Peut-on ajouter sa date et son adresse sur l'affiche officielle ?",
    a: "Le PDF officiel est conçu pour être imprimé tel quel (il porte déjà la mention 'vendredi 29 mai 2026'). Pour ajouter votre adresse précise, votre horaire ou un QR code, vous avez le choix : à la main sur le tirage imprimé, avec un éditeur PDF (Adobe Acrobat, PDF24, Sejda), ou en complément avec un outil dédié comme Voisinons.fr qui génère une affichette personnalisée à coller à côté.",
  },
  {
    q: "Quand télécharger le kit ?",
    a: "Idéalement 4 à 6 semaines avant l'événement, pour avoir le temps d'imprimer et de distribuer les flyers dans les boîtes aux lettres. Si vous vous y prenez à la dernière minute, un outil de personnalisation web vous fera gagner du temps puisqu'il ne nécessite ni téléchargement ni installation.",
  },
  {
    q: "Voisinons.fr remplace-t-il le kit officiel ?",
    a: "Non, c'est complémentaire. Le kit officiel reste la référence pour l'identité visuelle nationale (illustration, sponsors, logos). Voisinons.fr ajoute la couche manquante : une affiche personnalisée à votre événement (date, adresse, QR code d'inscription) en 30 secondes, plus une page web où vos voisins coordonnent ce qu'ils apportent.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://voisinons.fr/" },
    { "@type": "ListItem", position: 2, name: "Kit Fête des Voisins 2026", item: PAGE_URL },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  inLanguage: "fr-FR",
  isPartOf: {
    "@type": "WebSite",
    name: "Voisinons.fr",
    url: "https://voisinons.fr",
  },
  about: {
    "@id": "https://voisinons.fr/fete-des-voisins-2026#event",
  },
};

function OfficialPosterMockup() {
  return (
    <div className="relative aspect-[1240/1754] rounded-md overflow-hidden border border-neighbor-stone/10 shadow-sm bg-neighbor-cream">
      <Image
        src="/affiche-officielle-fdv-2026.jpg"
        alt="Affiche officielle de la Fête des Voisins 2026 — Voisins Solidaires"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 320px"
      />
    </div>
  );
}

function VoisinonsPosterMockup() {
  return (
    <div className="relative aspect-[1024/1536] bg-neighbor-cream rounded-md shadow-sm border border-neighbor-stone/10 bg-cover bg-center" style={{ backgroundImage: "url(/affiche-fete-des-voisins.png)" }}>
      <div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ top: "30.2%" }}
      >
        <p className="font-bold text-center" style={{ color: "#1E3A5F", fontSize: "clamp(10px, 2.4vw, 16px)", lineHeight: 1.1, marginBottom: "0.4em" }}>
          Vendredi 29 mai 2026
        </p>
        <p className="font-bold text-center" style={{ color: "#1E3A5F", fontSize: "clamp(9px, 2.2vw, 14px)", lineHeight: 1.1, marginBottom: "0.4em" }}>
          18:00 - 23:00
        </p>
        <p className="text-center px-6" style={{ color: "#2D4A6F", fontSize: "clamp(7px, 1.8vw, 12px)", lineHeight: 1.2 }}>
          12 rue de la Convivialité, 75011 Paris
        </p>
      </div>
      <div
        className="absolute bg-white p-1 shadow"
        style={{ top: "79.2%", left: "5.7%", width: "9.2%", aspectRatio: "94 / 87" }}
        aria-hidden
      >
        <div className="w-full h-full bg-[repeating-conic-gradient(#1E3A5F_0_25%,#fff_0_50%)] bg-[length:25%_25%]" />
      </div>
    </div>
  );
}

export default function KitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
              Édition 2026 • Vendredi 29 mai
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-neighbor-stone mb-6">
              Kit Fête des Voisins 2026 : comment l&apos;obtenir gratuitement
            </h1>
            <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-700 leading-relaxed">
              Le kit officiel édité chaque année par l&apos;association Voisins Solidaires
              regroupe les visuels nationaux de l&apos;événement : affiches illustrées, flyers,
              sets de table. Il est gratuit, téléchargeable directement sur fetedesvoisins.fr.
              Cette page explique comment y accéder, ce qu&apos;il contient, et comment le
              compléter avec une affichette personnalisée pour votre événement (date, adresse,
              QR code d&apos;inscription).
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-stone/5 flex flex-col">
              <p className="font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider text-neighbor-blue font-bold mb-2">
                Voie 1 — Officielle
              </p>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-4">
                Le kit Voisins Solidaires
              </h2>
              <div className="max-w-xs mx-auto w-full mb-6">
                <OfficialPosterMockup />
              </div>
              <ul className="space-y-2 font-[family-name:var(--font-outfit)] text-gray-700 text-sm leading-relaxed mb-6">
                <li>✓ Affiche illustrée nationale en haute qualité</li>
                <li>✓ Identité visuelle officielle avec les partenaires</li>
                <li>✓ 100 % gratuit, téléchargement direct</li>
                <li>✓ PDF prêt à imprimer pour les particuliers</li>
                <li>✓ Sources InDesign pour les services communication</li>
              </ul>
              <a
                href={OFFICIAL_KIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-neighbor-blue text-white px-5 py-3 rounded-full font-[family-name:var(--font-outfit)] font-bold hover:opacity-90 transition-opacity"
              >
                Télécharger sur fetedesvoisins.fr
                <span aria-hidden>↗</span>
              </a>
            </article>

            <article className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-orange/30 flex flex-col">
              <p className="font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider text-neighbor-orange font-bold mb-2">
                Voie 2 — Personnalisée
              </p>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-4">
                L&apos;affiche Voisinons
              </h2>
              <div className="max-w-xs mx-auto w-full mb-6">
                <VoisinonsPosterMockup />
              </div>
              <ul className="space-y-2 font-[family-name:var(--font-outfit)] text-gray-700 text-sm leading-relaxed mb-6">
                <li>✓ Affiche personnalisée à votre date et adresse</li>
                <li>✓ QR code d&apos;inscription intégré</li>
                <li>✓ Page web pour coordonner les apports des voisins</li>
                <li>✓ PDF léger prêt à imprimer (&lt; 5 Mo)</li>
                <li>✓ Généré en 30 secondes, sans logiciel à installer</li>
              </ul>
              <Link
                href="/creer"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-neighbor-orange text-white px-5 py-3 rounded-full font-[family-name:var(--font-outfit)] font-bold hover:bg-neighbor-stone transition-colors"
              >
                Créer mon affiche maintenant
                <span aria-hidden>→</span>
              </Link>
            </article>
          </div>
          <p className="max-w-5xl mx-auto mt-6 text-center text-sm text-gray-500 font-[family-name:var(--font-outfit)] italic">
            Beaucoup d&apos;organisateurs utilisent les deux ensemble : l&apos;affiche officielle
            dans le hall pour le signal national, l&apos;affichette Voisinons en flyer dans les
            boîtes aux lettres avec les infos perso et le QR d&apos;inscription.
          </p>
        </section>

        <article className="px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-12 font-[family-name:var(--font-outfit)] text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Qu&apos;est-ce que le kit Fête des Voisins exactement ?
              </h2>
              <p className="text-lg">
                Le kit officiel est édité chaque année par l&apos;association{" "}
                <strong>Voisins Solidaires</strong> (initiateur de la Fête des Voisins en 1999) en
                partenariat avec le Ministère du Logement, l&apos;Association des Maires de
                France, l&apos;Union Sociale pour l&apos;Habitat, Century 21 et Haribo. Il
                rassemble les visuels nationaux de l&apos;événement : affiche illustrée, flyers,
                sets de table, en différentes déclinaisons (national / mairies, A3 / A4 / format
                réseaux sociaux).
              </p>
              <p className="text-lg mt-4">
                Le kit est <strong>gratuit, en téléchargement direct</strong>, sans inscription,
                sur{" "}
                <a
                  href={OFFICIAL_KIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neighbor-orange font-bold hover:underline"
                >
                  fetedesvoisins.fr/nos-kits-de-communication
                </a>
                . Il est proposé sous deux usages : un <strong>PDF prêt à imprimer</strong> pour
                les particuliers et organisateurs, et des <strong>sources InDesign</strong> pour
                les services communication des mairies et copropriétés qui souhaitent décliner
                l&apos;identité avec leur logo.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Comment imprimer le kit sans logiciel graphique
              </h2>
              <p className="text-lg">
                Pour la majorité des organisateurs (particuliers, conseils syndicaux, voisins
                d&apos;un même immeuble), la voie la plus directe consiste à utiliser le PDF
                national prêt à imprimer :
              </p>
              <ol className="list-decimal list-outside ml-5 mt-4 space-y-3 text-lg">
                <li>
                  Sur la page officielle, téléchargez la section{" "}
                  <strong>« Affiches National »</strong> — c&apos;est celle qui contient les PDF
                  prêts à imprimer.
                </li>
                <li>
                  Dans l&apos;archive ZIP, ouvrez le fichier <strong>PDF A4</strong>.
                </li>
                <li>
                  Imprimez-le tel quel : il contient déjà la mention « vendredi 29 mai 2026 » et
                  l&apos;identité visuelle nationale.
                </li>
                <li>
                  Affichez-le dans le hall, et complétez si besoin avec votre date précise,
                  l&apos;adresse exacte et un QR code d&apos;inscription (étape suivante).
                </li>
              </ol>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Personnaliser avec votre date, votre adresse et un QR code
              </h2>
              <p className="text-lg">
                L&apos;affiche officielle nationale donne le signal d&apos;appartenance à la fête.
                Pour les détails propres à votre événement (heure de rendez-vous, adresse précise,
                inscription des voisins), trois options selon votre équipement :
              </p>
              <ul className="list-disc list-outside ml-5 mt-4 space-y-2 text-lg">
                <li>
                  <strong>À la main</strong> sur l&apos;affiche imprimée : un feutre, un post-it
                  collé, une note manuscrite à côté. C&apos;est la voie la plus rapide pour les
                  petites copropriétés.
                </li>
                <li>
                  <strong>Avec un éditeur PDF</strong> : si vous êtes équipé en Adobe Acrobat ou
                  un outil gratuit comme PDF24 ou Sejda, vous pouvez ajouter un cadre texte
                  par-dessus le PDF officiel.
                </li>
                <li>
                  <strong>Avec un outil dédié comme Voisinons.fr</strong> : qui produit
                  directement une affichette A4 avec votre date, votre adresse et un QR code
                  pointant vers la page d&apos;inscription des voisins. À utiliser en complément
                  du visuel officiel ou en flyer pour les boîtes aux lettres.
                </li>
              </ul>
            </section>

            <section className="bg-neighbor-stone text-white rounded-3xl p-8 md:p-12">
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl mb-4">
                Compléter avec une affichette personnalisée
              </h2>
              <p className="text-lg text-white/85 mb-6 max-w-xl">
                Voisinons.fr génère une affiche A4 personnalisée à votre événement (date, adresse,
                QR code d&apos;inscription) ainsi qu&apos;une page web où vos voisins coordonnent
                ce qu&apos;ils apportent — en 30 secondes, sans inscription, sans logiciel.
                À utiliser à côté de l&apos;affiche officielle ou en flyer dans les boîtes aux
                lettres.
              </p>
              <Link
                href="/creer"
                className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-bold hover:bg-neighbor-yellow hover:text-neighbor-stone transition-colors"
              >
                Créer mon affichette en 30 secondes
                <span aria-hidden>→</span>
              </Link>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Et le kit de la mairie ?
              </h2>
              <p className="text-lg">
                En complément du kit national, beaucoup de mairies distribuent un{" "}
                <strong>kit physique</strong> aux organisateurs : gobelets, ballons, t-shirts,
                affiches A3 imprimées, sets de table. C&apos;est gratuit mais à demander à
                l&apos;avance (généralement avant le 15 mai). Le service à contacter est le
                <strong> service vie de quartier</strong>, <strong>démocratie locale</strong>{" "}
                ou <strong>relations habitants</strong> selon les communes.
              </p>
              <p className="text-lg mt-4">
                Sélectionnez votre commune ci-dessous pour récupérer l&apos;email officiel
                de la mairie et un brouillon de mail prérempli avec son nom :
              </p>
              <div className="mt-6">
                <MairieMailBlock />
              </div>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-6">
                Questions fréquentes
              </h2>
              <div className="space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-2">
                      {f.q}
                    </h3>
                    <p className="text-lg">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-gray-200 pt-12">
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-4">
                Pour aller plus loin
              </h2>
              <ul className="space-y-3 text-lg">
                <li>
                  →{" "}
                  <Link
                    href="/fete-des-voisins-2026"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Date officielle Fête des Voisins 2026
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/guide-fete-des-voisins-2026"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Guide complet pour organiser la Fête des Voisins
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/modeles-invitation"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Modèles d&apos;invitation à copier-coller
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/creer"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Créer ma fête en 30 secondes
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
