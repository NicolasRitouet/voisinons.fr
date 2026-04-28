import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageHeader } from "@/components/landing/content-page-header";
import { Footer } from "@/components/landing/footer";

const PAGE_URL = "https://voisinons.fr/guide-fete-des-voisins-2026";
const TITLE = "Comment organiser la Fête des Voisins 2026 : guide en 7 étapes";
const DESCRIPTION =
  "Le guide complet pour organiser une Fête des Voisins réussie le 29 mai 2026 : checklist, modèles, démarches mairie/syndic, idées repas et animations.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guide-fete-des-voisins-2026" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

const steps = [
  {
    title: "Trouver 1 ou 2 voisins motivés",
    estimatedTime: "PT15M",
    text: "Avant tout, ne portez pas la fête seul·e. Trouvez 1 ou 2 voisins de confiance pour former un mini-comité d'organisation. Ça répartit la charge mentale et ça donne immédiatement plus de crédibilité auprès des autres habitants. Le bon moment pour les recruter : lors d'une rencontre fortuite (ascenseur, hall, courrier) ou via un mot dans le hall.",
  },
  {
    title: "Choisir une date et un lieu",
    estimatedTime: "PT10M",
    text: "La date officielle 2026 est le vendredi 29 mai. Vous pouvez aussi décaler d'une semaine. Pour le lieu : hall d'immeuble (le plus simple, aucune autorisation), cour de copropriété (prévenir le syndic), portion de rue (autorisation mairie obligatoire, gratuite). Pensez au plan B en cas de pluie dès le départ.",
  },
  {
    title: "Faire les démarches administratives",
    estimatedTime: "PT30M",
    text: "Pour une fête en hall ou cour d'immeuble : un email au syndic suffit, mais faites-le. Pour la voie publique : remplissez la demande d'occupation temporaire du domaine public sur le site de votre mairie, 2 à 4 semaines avant. Demandez en même temps si la mairie propose un kit gratuit (affiches, gobelets, ballons).",
  },
  {
    title: "Créer une affiche et inviter",
    estimatedTime: "PT30M",
    text: "Préparez une affiche avec date, heure, lieu, principe (chacun apporte) et un contact. Affichez-la dans le hall et déposez une version réduite (flyer A6) dans chaque boîte aux lettres. Pour gagner du temps, Voisinons.fr génère affiche PDF + page web + QR code en 30 secondes. Le QR code est essentiel : il permet à chacun de s'inscrire et de dire ce qu'il apporte sans avoir à recopier une URL.",
  },
  {
    title: "Coordonner les apports",
    estimatedTime: "PT1H",
    text: "Sans coordination, vous aurez 8 quiches lorraines et zéro boisson. Plusieurs options : un fichier Google Sheets partagé (gratuit mais demande un compte), un groupe WhatsApp (rapide mais bruyant), ou une page d'inscription type Voisinons.fr (anonyme, propre, suppression automatique après l'événement). Dans tous les cas, listez les catégories à couvrir : entrées, plats, desserts, boissons soft, vin, gobelets, assiettes.",
  },
  {
    title: "Préparer la logistique le jour J",
    estimatedTime: "PT2H",
    text: "Liste minimale : tables (le syndic peut prêter, sinon planches sur tréteaux), nappes en papier, gobelets et assiettes (compostables si possible), serviettes, sacs poubelle, une enceinte Bluetooth, une rallonge électrique, des chaises pour les personnes âgées. Pour les enfants : prévoir une mini-table dédiée ou quelques jeux. Demander à un voisin de venir 30 minutes en avance pour aider à installer.",
  },
  {
    title: "Le jour J et après",
    estimatedTime: "PT4H",
    text: "Arrivez 30 minutes avant l'horaire pour installer. Saluez chaque arrivant en personne. Présentez les voisins entre eux activement (« Tiens, Marie est aussi prof, comme toi »). Évitez les longs discours — l'essentiel c'est de discuter par petits groupes. Pensez à prendre quelques photos d'ambiance (avec consentement) pour les partager le lendemain : c'est ce qui crée l'effet « il faut refaire ça l'année prochaine ».",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment organiser la Fête des Voisins 2026",
  description:
    "Guide pas-à-pas pour organiser une Fête des Voisins réussie en 7 étapes, du recrutement de voisins motivés à la logistique du jour J.",
  totalTime: "PT8H",
  estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0" },
  supply: [
    { "@type": "HowToSupply", name: "Affiche imprimée" },
    { "@type": "HowToSupply", name: "Tables et chaises" },
    { "@type": "HowToSupply", name: "Gobelets et assiettes" },
  ],
  tool: [
    { "@type": "HowToTool", name: "Voisinons.fr — outil gratuit de coordination" },
  ],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

const faqs = [
  {
    q: "Combien de temps faut-il pour préparer la Fête des Voisins ?",
    a: "Comptez 4 à 6 semaines avant l'événement pour les démarches mairie et l'invitation. La logistique du jour J prend environ 2 heures. La création de l'affiche et de la page d'inscription prend 30 secondes avec un outil comme Voisinons.fr.",
  },
  {
    q: "Combien de personnes inviter ?",
    a: "Tous les habitants de votre immeuble ou de votre rue. En pratique, comptez sur 20 à 40 % de participation pour une première fête. Pour 30 logements, prévoyez donc une logistique pour 20-25 personnes environ.",
  },
  {
    q: "Faut-il prévoir un budget ?",
    a: "Non. La Fête des Voisins fonctionne sur le principe du potluck : chaque participant apporte un plat ou une boisson. Le budget commun se limite éventuellement à quelques fournitures (gobelets, nappes) que les organisateurs peuvent partager — comptez 20 à 40 € maximum.",
  },
  {
    q: "Mon voisin est difficile ou hostile, comment faire ?",
    a: "Invitez-le quand même. Une invitation polie et neutre, sans pression, est souvent désamorçante. S'il refuse, n'insistez pas — l'objectif n'est pas de convaincre tout le monde mais de réunir ceux qui veulent se connaître.",
  },
  {
    q: "Que faire des restes ?",
    a: "Chaque voisin repart avec ce qu'il a apporté (les contenants en témoignent). Les restes du buffet collectif peuvent être proposés via un message le lendemain (« il reste 4 parts de tarte aux pommes, premier servi au 3ème étage »).",
  },
  {
    q: "Peut-on faire une Fête des Voisins en hiver ou en automne ?",
    a: "Bien sûr. La date officielle est en mai mais rien n'interdit d'organiser un goûter de Noël entre voisins, un brunch d'automne ou une fête après les déménagements de septembre. Voisinons.fr fonctionne pour n'importe quelle micro-fête de proximité.",
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

export default function GuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
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
              Guide pratique • Édition 2026
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-neighbor-stone mb-6">
              Comment organiser la Fête des Voisins en{" "}
              <span className="text-neighbor-orange">7 étapes</span>
            </h1>
            <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-700 leading-relaxed">
              Tout ce qu&apos;il faut savoir pour réussir votre fête le{" "}
              <Link
                href="/fete-des-voisins-2026"
                className="text-neighbor-orange font-bold hover:underline"
              >
                vendredi 29 mai 2026
              </Link>
              {" "}— de la première invitation au verre de l&apos;amitié. Sans jargon, sans
              surproduction, en moins de 6 heures de préparation totale.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-stone/5">
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              En résumé
            </h2>
            <ul className="space-y-2 font-[family-name:var(--font-outfit)] text-gray-700">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="text-neighbor-orange font-bold">{i + 1}.</span>
                  <a
                    href={`#etape-${i + 1}`}
                    className="hover:text-neighbor-orange transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <article className="px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-12 font-[family-name:var(--font-outfit)] text-gray-700 leading-relaxed">
            {steps.map((step, i) => (
              <section
                key={step.title}
                id={`etape-${i + 1}`}
                className="scroll-mt-24"
              >
                <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-wider text-neighbor-orange font-bold mb-2">
                  Étape {i + 1}
                </p>
                <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                  {step.title}
                </h2>
                <p className="text-lg whitespace-pre-line">{step.text}</p>
              </section>
            ))}

            <section className="bg-neighbor-stone text-white rounded-3xl p-8 md:p-12">
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl mb-4">
                Étape 4 simplifiée : générez votre affiche en 30 secondes
              </h2>
              <p className="text-lg text-white/85 mb-6 max-w-xl">
                Plutôt que de bricoler une affiche sur Word, Voisinons.fr génère votre affiche PDF
                imprimable, votre page d&apos;inscription et votre QR code en moins d&apos;une
                minute. Anonyme, gratuit, sans compte, RGPD.
              </p>
              <Link
                href="/creer"
                className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-bold hover:bg-neighbor-yellow hover:text-neighbor-stone transition-colors"
              >
                Créer ma fête
                <span aria-hidden>→</span>
              </Link>
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
