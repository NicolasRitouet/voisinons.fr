import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageHeader } from "@/components/landing/content-page-header";
import { Footer } from "@/components/landing/footer";

const PAGE_URL = "https://voisinons.fr/affiches-fete-des-voisins";
const TITLE = "Affiches Fête des Voisins gratuites à imprimer (PDF + QR code)";
const DESCRIPTION =
  "8 styles d'affiches pour la Fête des Voisins 2026 — générées automatiquement en PDF haute définition avec QR code intégré. Gratuit, personnalisable, sans inscription.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/affiches-fete-des-voisins" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

type Style = {
  slug: string;
  name: string;
  description: string;
  audience: string;
  palette: { bg: string; accent: string; text: string };
  vibe: string;
};

const styles: Style[] = [
  {
    slug: "classique-immeuble",
    name: "Classique immeuble",
    description:
      "Le grand classique pour le hall : une affiche claire, lisible à distance, avec date et heure mises en avant. Parfaite pour un affichage A4 dans une vitrine de hall.",
    audience: "Immeubles 10-50 logements",
    palette: { bg: "#F9F8F2", accent: "#EB5E28", text: "#264653" },
    vibe: "lisibilité",
  },
  {
    slug: "rue-pavillonnaire",
    name: "Rue pavillonnaire",
    description:
      "Format paysage adapté aux grandes boîtes aux lettres et au papier pelliculé. Mise en avant du nom de rue pour un sentiment d'appartenance immédiat.",
    audience: "Rues, lotissements, hameaux",
    palette: { bg: "#264653", accent: "#E9C46A", text: "#F9F8F2" },
    vibe: "convivial",
  },
  {
    slug: "copropriete-chic",
    name: "Copropriété chic",
    description:
      "Style sobre et élégant pour les résidences haut de gamme. Typographie soignée, palette feutrée, idéal pour les copropriétés où le syndic souhaite un visuel premium.",
    audience: "Résidences haut standing",
    palette: { bg: "#F9F8F2", accent: "#264653", text: "#264653" },
    vibe: "élégant",
  },
  {
    slug: "petit-immeuble",
    name: "Petit immeuble",
    description:
      "Pour les immeubles de 3 à 10 logements. Format réduit, ton chaleureux, place pour les prénoms si vous souhaitez personnaliser au maximum.",
    audience: "Petits immeubles, maisons partagées",
    palette: { bg: "#FBE8D9", accent: "#EB5E28", text: "#264653" },
    vibe: "intime",
  },
  {
    slug: "famille-enfants",
    name: "Famille & enfants",
    description:
      "Couleurs vives, typographie joueuse. Idéal pour annoncer une fête où les enfants sont les bienvenus et où des animations sont prévues (jeux, ateliers, mini-buffet).",
    audience: "Résidences familiales, écoles",
    palette: { bg: "#E9C46A", accent: "#EB5E28", text: "#264653" },
    vibe: "ludique",
  },
  {
    slug: "minimaliste",
    name: "Minimaliste",
    description:
      "Une seule typographie forte, beaucoup de blanc, message direct. Pour ceux qui veulent un visuel qui ne fait pas «&nbsp;flyer&nbsp;» mais affiche d&apos;auteur.",
    audience: "Quartiers urbains design-aware",
    palette: { bg: "#F9F8F2", accent: "#1e201f", text: "#1e201f" },
    vibe: "graphique",
  },
  {
    slug: "ecologique",
    name: "Écologique",
    description:
      "Palette végétale, vocabulaire « zéro déchet » : invitation à apporter ses propres gobelets et assiettes. Cohérent avec une charte écoresponsable d&apos;immeuble.",
    audience: "Immeubles éco-responsables",
    palette: { bg: "#F9F8F2", accent: "#2A9D8F", text: "#264653" },
    vibe: "responsable",
  },
  {
    slug: "soiree-musicale",
    name: "Soirée musicale",
    description:
      "Pour annoncer une fête avec animation musicale (guitare acoustique, DJ amateur, karaoké). Ambiance plus tardive (19h-23h) clairement assumée sur l&apos;affiche.",
    audience: "Quartiers ouverts à l'animation",
    palette: { bg: "#264653", accent: "#EB5E28", text: "#F9F8F2" },
    vibe: "festif",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Affiches Fête des Voisins 2026",
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  numberOfItems: styles.length,
  itemListElement: styles.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.name,
    description: s.description,
    url: `${PAGE_URL}#${s.slug}`,
  })),
};

const faqs = [
  {
    q: "Les affiches sont-elles vraiment gratuites ?",
    a: "Oui. Voisinons.fr génère votre affiche PDF gratuitement, sans inscription, sans création de compte. Vous n'aurez jamais à payer pour la télécharger ou l'imprimer.",
  },
  {
    q: "Dans quel format sont les affiches ?",
    a: "Les affiches sont générées en PDF haute définition (300 dpi), au format A4 portrait par défaut. Elles peuvent être imprimées chez vous ou portées chez un imprimeur sans perte de qualité.",
  },
  {
    q: "Puis-je modifier le texte ?",
    a: "Oui. Toutes les informations principales sont personnalisables : nom de la fête, date, heure, adresse, message d'introduction. Le QR code est généré automatiquement et pointe vers la page d'inscription.",
  },
  {
    q: "À quoi sert le QR code sur l'affiche ?",
    a: "Le QR code permet à n'importe quel voisin de scanner l'affiche avec son téléphone et d'arriver directement sur la page d'inscription : il indique son nom, ce qu'il apporte et combien il sera. Plus besoin de coller un papier dans le hall.",
  },
  {
    q: "Y a-t-il une affiche officielle Fête des Voisins ?",
    a: "Oui, l'association Voisins Solidaires propose un kit officiel téléchargeable sur fetedesvoisins.fr. Voisinons.fr est un outil indépendant qui produit une affiche personnalisée à votre événement, complémentaire au kit officiel.",
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

function PosterPreview({ style }: { style: Style }) {
  return (
    <div
      className="aspect-[3/4] rounded-2xl p-6 flex flex-col justify-between border border-neighbor-stone/10 shadow-sm overflow-hidden relative"
      style={{ background: style.palette.bg, color: style.palette.text }}
    >
      <div className="flex justify-between items-start">
        <div
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: style.palette.accent }}
        >
          {style.vibe}
        </div>
        <div
          className="w-10 h-10 rounded-md grid place-items-center text-[8px] font-mono"
          style={{
            background: style.palette.text,
            color: style.palette.bg,
          }}
        >
          QR
        </div>
      </div>

      <div>
        <div
          className="text-xs uppercase tracking-widest font-bold mb-1"
          style={{ color: style.palette.accent }}
        >
          29 mai 2026
        </div>
        <div
          className="font-[family-name:var(--font-space-grotesk)] font-extrabold leading-[0.95] text-2xl md:text-3xl"
        >
          Fête des Voisins
        </div>
        <div
          className="text-[10px] mt-2 opacity-70"
          style={{ color: style.palette.text }}
        >
          18h00 — Hall d&apos;immeuble
        </div>
      </div>

      <div
        className="text-[10px] font-bold opacity-70"
        style={{ color: style.palette.text }}
      >
        voisinons.fr
      </div>
    </div>
  );
}

export default function AffichesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
              8 styles • Gratuit • PDF + QR code
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-neighbor-stone mb-6">
              Affiches Fête des Voisins gratuites à imprimer
            </h1>
            <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-700 leading-relaxed">
              Plutôt que de télécharger un PDF figé, Voisinons.fr{" "}
              <strong>génère votre affiche personnalisée en 30 secondes</strong> avec votre date,
              votre adresse et un QR code d&apos;inscription. Voici 8 styles thématiques pour
              vous inspirer.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {styles.map((style) => (
              <article
                key={style.slug}
                id={style.slug}
                className="scroll-mt-24"
              >
                <PosterPreview style={style} />
                <div className="mt-3">
                  <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-base text-neighbor-stone">
                    {style.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-[family-name:var(--font-outfit)] mt-1">
                    {style.audience}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto bg-neighbor-stone text-white rounded-3xl p-8 md:p-12 text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl md:text-4xl mb-4">
              Personnalisez la vôtre en 30 secondes
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-lg text-white/85 mb-6 max-w-xl mx-auto">
              Date, heure, adresse, message — tout est personnalisable. Le QR code est généré
              automatiquement. PDF haute définition prêt à imprimer.
            </p>
            <Link
              href="/creer"
              className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-bold hover:bg-neighbor-yellow hover:text-neighbor-stone transition-colors"
            >
              Créer mon affiche
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <article className="px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-12 font-[family-name:var(--font-outfit)] text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Pourquoi générer plutôt que télécharger ?
              </h2>
              <p className="text-lg">
                La plupart des modèles d&apos;affiches Fête des Voisins disponibles en ligne sont
                des PDF ou Word à modifier soi-même : il faut télécharger, ouvrir un éditeur,
                changer le texte, exporter, parfois réajuster les marges. Compter 20 à 40 minutes.
              </p>
              <p className="text-lg mt-4">
                Voisinons.fr fait le travail pour vous : vous remplissez 5 champs (nom de la fête,
                adresse, date, heure, message), et l&apos;affiche est prête en PDF imprimable.
                <strong> Le QR code est généré automatiquement</strong> et pointe vers une page
                d&apos;inscription propre où chaque voisin peut indiquer ce qu&apos;il apporte.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Conseils d&apos;impression
              </h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-lg">
                <li>
                  Imprimez l&apos;affiche en <strong>A4 couleur</strong>. Évitez le N&amp;B :
                  l&apos;orange et le QR code perdent en visibilité.
                </li>
                <li>
                  Pour le hall d&apos;immeuble, prévoyez 2 affiches : une à hauteur d&apos;yeux
                  près de la porte, une près des boîtes aux lettres.
                </li>
                <li>
                  Pour les boîtes aux lettres, imprimez la même affiche en{" "}
                  <strong>4 par page</strong> (option « 4 sur 1 » de votre imprimante) et découpez
                  en flyers A6.
                </li>
                <li>
                  Si vous passez chez un imprimeur, demandez un papier 120 g : l&apos;affiche
                  tient mieux dans une vitrine de hall.
                </li>
                <li>
                  Pour une fête en extérieur, plastifiez l&apos;affiche du panneau d&apos;entrée
                  d&apos;immeuble — un coup de pluie peut l&apos;effacer en une nuit.
                </li>
              </ul>
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
                    href="/guide-fete-des-voisins-2026"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Guide complet pour organiser la Fête des Voisins
                  </Link>
                </li>
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
                    href="/creer"
                    className="text-neighbor-orange font-bold hover:underline"
                  >
                    Créer mon affiche personnalisée
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
