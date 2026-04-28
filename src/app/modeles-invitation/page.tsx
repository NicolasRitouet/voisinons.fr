import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageHeader } from "@/components/landing/content-page-header";
import { Footer } from "@/components/landing/footer";
import { CopyButton } from "@/components/landing/copy-button";

const PAGE_URL = "https://voisinons.fr/modeles-invitation";
const TITLE =
  "Modèles d'invitation Fête des Voisins 2026 (textes prêts à copier)";
const DESCRIPTION =
  "8 modèles de textes à copier-coller pour inviter vos voisins à la Fête des Voisins du 29 mai 2026 : mot dans la boîte aux lettres, message WhatsApp, email syndic, SMS de relance.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/modeles-invitation" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
};

type Template = {
  slug: string;
  channel: string;
  context: string;
  body: string;
};

const templates: Template[] = [
  {
    slug: "boite-aux-lettres",
    channel: "Mot dans la boîte aux lettres",
    context:
      "Le format le plus efficace pour toucher tout l'immeuble, y compris les voisins âgés ou peu connectés. À glisser une dizaine de jours avant la fête.",
    body: `Bonjour cher·ère voisin·e,

Le vendredi 29 mai 2026, c'est la Fête des Voisins partout en France — et nous aimerions que ce soit aussi le cas dans notre immeuble !

Rendez-vous dans le hall à partir de 18h30 pour partager un verre, un plat, et faire enfin connaissance. Chacun apporte ce qu'il veut (boisson, plat salé ou sucré), on s'occupe du reste.

Pour confirmer votre venue et nous dire ce que vous apportez, scannez le QR code de l'affiche dans le hall ou rendez-vous sur la page de la fête.

À très vite,
[Votre prénom — Appartement X]`,
  },
  {
    slug: "hall-immeuble",
    channel: "Affichette pour le hall",
    context:
      "Texte court à mettre sous l'affiche officielle ou en complément si vous bricolez votre propre affichage. Format A5 idéalement.",
    body: `🍷 FÊTE DES VOISINS 🍷

Vendredi 29 mai 2026, à partir de 18h30
Dans le hall de notre immeuble

Apportez : un plat à partager, une boisson, ou juste vous-même.
Inscrivez-vous (et dites ce que vous apportez) en scannant le QR code ci-dessus.

Organisé par [Prénom, Apt X] — questions : [téléphone ou email]`,
  },
  {
    slug: "whatsapp-groupe",
    channel: "Message WhatsApp groupe immeuble",
    context:
      "Pour les immeubles qui ont déjà un groupe. Ton informel, emojis bienvenus, message court qui passe bien sur mobile.",
    body: `Hello tout le monde 👋

Le 29 mai c'est la Fête des Voisins, on en organise une dans le hall ?

Je propose : vendredi 29 mai à partir de 18h30, hall du rez-de-chaussée, on amène chacun un truc (plat, boisson, dessert).

Pour s'inscrire et coordonner ce que chacun apporte (genre éviter d'avoir 8 quiches 😅) : [lien Voisinons]

Qui est partant ? 🎉`,
  },
  {
    slug: "syndic",
    channel: "Email au syndic ou conseil syndical",
    context:
      "À envoyer 3 à 4 semaines avant pour valider l'usage des parties communes et demander l'aide du syndic (prêt de tables, électricité, ménage post-événement).",
    body: `Madame, Monsieur,

Plusieurs résidents souhaitent organiser une Fête des Voisins le vendredi 29 mai 2026 dans le hall et la cour intérieure de l'immeuble [adresse], à partir de 18h30 et jusqu'à 23h au plus tard.

Cet événement gratuit, sur le principe du repas partagé, vise à renforcer le lien entre les habitants. Une dizaine d'événements similaires sont organisés chaque année dans des copropriétés comparables sans incident.

Nous nous engageons à :
- assurer le nettoyage complet des espaces utilisés en fin de soirée,
- limiter le bruit après 22h conformément au règlement intérieur,
- prévenir l'ensemble des résidents au moins 15 jours à l'avance.

Pourriez-vous nous confirmer votre accord, ainsi que la possibilité éventuelle de prêter quelques tables et chaises pliantes ?

Bien cordialement,
[Votre prénom — Appartement X]`,
  },
  {
    slug: "email-voisins",
    channel: "Email aux voisins (carnet d'adresses)",
    context:
      "Si vous avez les emails de quelques voisins, version plus chaleureuse et personnelle. À envoyer 2 semaines avant.",
    body: `Bonjour [Prénom],

J'espère que tu vas bien. Petit message rapide : avec [autre voisin], on aimerait organiser une Fête des Voisins dans notre immeuble le vendredi 29 mai 2026, à partir de 18h30, dans le hall.

L'idée est simple : chacun apporte ce qu'il veut (un plat, une bouteille, un dessert), on installe deux tables, et on prend le temps de se rencontrer vraiment. Sans pression, sans inscription compliquée.

J'ai créé une petite page où tu peux confirmer ta venue et indiquer ce que tu comptes apporter (pour qu'on évite les doublons) : [lien Voisinons]

Hâte de te voir là-bas !
[Ton prénom]`,
  },
  {
    slug: "sms-relance",
    channel: "SMS de relance J-3",
    context:
      "Pour ré-activer ceux qui n'ont pas encore confirmé. À envoyer le mardi pour une fête le vendredi.",
    body: `Hello [prénom] ! Petit rappel : Fête des Voisins ce vendredi 29/05 à partir de 18h30 dans le hall. T'es des nôtres ? Tu peux confirmer en 10 secondes ici : [lien]. À vendredi 🎉`,
  },
  {
    slug: "ascenseur",
    channel: "Mot pour l'ascenseur",
    context:
      "Format ultra court, à scotcher dans l'ascenseur 5 jours avant. À placer à hauteur d'yeux pour qu'on le lise pendant les quelques secondes du trajet.",
    body: `🎉 Vendredi 29 mai → 18h30, hall.
Fête des Voisins. On s'occupe de tout, vous amenez ce que vous voulez.
Inscription : QR code sur l'affiche ou voisinons.fr/[slug]`,
  },
  {
    slug: "facebook-quartier",
    channel: "Post groupe Facebook quartier",
    context:
      "Pour les fêtes ouvertes au-delà de l'immeuble (rue, quartier). Le ton est public, engageant, avec un appel à mobiliser.",
    body: `Voisin·es du quartier [nom du quartier], on organise une Fête des Voisins le vendredi 29 mai 2026 ! 🎉

📍 [adresse / rue / square]
🕕 À partir de 18h30
🍕 Chacun apporte un plat ou une boisson à partager
👶 Tout le monde est bienvenu (enfants compris)

On a réservé la portion de rue auprès de la mairie, il y aura des tables, de la musique douce et beaucoup de bonne humeur.

Plus on est de voisins, mieux c'est : si vous êtes partant·e, dites-le en commentaire ou inscrivez-vous ici (ça aide à coordonner les apports) : [lien Voisinons]

#FeteDesVoisins #[quartier] #VoisinsSolidaires`,
  },
];

const faqs = [
  {
    q: "Comment personnaliser ces textes ?",
    a: "Chaque modèle contient des éléments entre crochets ([Votre prénom], [adresse]…) à remplacer par vos propres infos. Le QR code ou le lien d'inscription est généré automatiquement quand vous créez votre fête sur Voisinons.fr — il vous suffit de coller l'URL.",
  },
  {
    q: "Combien de temps avant l'événement faut-il envoyer les invitations ?",
    a: "Pour le mot dans la boîte aux lettres ou l'email : 10 à 14 jours avant. Pour le message WhatsApp groupe : 1 semaine avant. Pour le SMS de relance : 2 à 3 jours avant. Plus tôt n'est pas mieux : les gens oublient.",
  },
  {
    q: "Le syndic peut-il refuser l'organisation de la fête ?",
    a: "Le syndic peut refuser pour des motifs sérieux (sécurité, nuisances passées, règlement de copropriété) mais ne peut pas s'opposer arbitrairement à l'usage des parties communes pour un événement ponctuel. En cas de refus, demandez la motivation par écrit et adressez-vous au conseil syndical.",
  },
  {
    q: "Faut-il prévenir tous les voisins individuellement ou un mot collectif suffit ?",
    a: "L'expérience montre qu'une affiche dans le hall + un mot dans chaque boîte aux lettres + un message dans le groupe WhatsApp s'il existe = la combinaison qui maximise les retours. L'affiche seule n'est pas suffisante : beaucoup de voisins ne la voient pas.",
  },
  {
    q: "Que faire si très peu de voisins répondent à l'invitation ?",
    a: "Maintenez la fête, même à 5 ou 6. Les premières éditions sont toujours timides. Demandez aux participants présents d'inviter par bouche à oreille les hésitants : cela double souvent la participation au dernier moment. La vraie magie commence à partir de la deuxième édition.",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Modèles d'invitation Fête des Voisins 2026",
  numberOfItems: templates.length,
  itemListElement: templates.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.channel,
    url: `${PAGE_URL}#${t.slug}`,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function PosterPreview() {
  // Mockup fidèle au PDF généré par /api/party/[slug]/poster :
  // background = /public/affiche-fete-des-voisins.png, mêmes positions
  // relatives que les coordonnées du PDF (page 595×893pt).
  return (
    <div className="relative max-w-sm mx-auto">
      <div
        className="relative aspect-[1024/1536] bg-neighbor-cream rounded-md shadow-2xl bg-cover bg-center"
        style={{ backgroundImage: "url(/affiche-fete-des-voisins.png)" }}
      >
        <div
          className="absolute left-0 right-0 flex flex-col items-center"
          style={{ top: "30.2%" }}
        >
          <p
            className="font-bold text-center"
            style={{
              color: "#1E3A5F",
              fontSize: "clamp(11px, 2.6vw, 18px)",
              lineHeight: 1.1,
              marginBottom: "0.4em",
            }}
          >
            Vendredi 29 mai 2026
          </p>
          <p
            className="font-bold text-center"
            style={{
              color: "#1E3A5F",
              fontSize: "clamp(10px, 2.4vw, 16px)",
              lineHeight: 1.1,
              marginBottom: "0.4em",
            }}
          >
            18:00 - 23:00
          </p>
          <p
            className="text-center px-6"
            style={{
              color: "#2D4A6F",
              fontSize: "clamp(8px, 2vw, 13px)",
              lineHeight: 1.2,
            }}
          >
            12 rue de la Convivialité, 75011 Paris
          </p>
        </div>
        <div
          className="absolute bg-white p-1 shadow"
          style={{
            top: "79.2%",
            left: "5.7%",
            width: "9.2%",
            aspectRatio: "94 / 87",
          }}
          aria-hidden
        >
          <div className="w-full h-full bg-[repeating-conic-gradient(#1E3A5F_0_25%,#fff_0_50%)] bg-[length:25%_25%]" />
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-3 font-[family-name:var(--font-outfit)] italic">
        Aperçu fidèle de l&apos;affiche A4 PDF générée par Voisinons.fr
      </p>
    </div>
  );
}

export default function ModelesInvitationPage() {
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
              {templates.length} modèles • Copier-coller • Gratuit
            </p>
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-neighbor-stone mb-6">
              Modèles d&apos;invitation Fête des Voisins 2026
            </h1>
            <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-700 leading-relaxed">
              Des textes prêts à copier pour chaque canal — du mot dans la boîte aux lettres au
              message WhatsApp, en passant par l&apos;email au syndic. Il ne reste qu&apos;à
              changer votre prénom et l&apos;adresse.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-stone/5">
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              Choisir le bon modèle
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-[family-name:var(--font-outfit)] text-gray-700">
              {templates.map((t, i) => (
                <li key={t.slug}>
                  <a
                    href={`#${t.slug}`}
                    className="flex gap-3 py-1 hover:text-neighbor-orange transition-colors"
                  >
                    <span className="text-neighbor-orange font-bold">{i + 1}.</span>
                    <span>{t.channel}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto space-y-6">
            {templates.map((t, i) => (
              <article
                key={t.slug}
                id={t.slug}
                className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-stone/5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider text-neighbor-orange font-bold mb-1">
                      Modèle {i + 1}
                    </p>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl md:text-2xl text-neighbor-stone">
                      {t.channel}
                    </h2>
                  </div>
                  <CopyButton text={t.body} />
                </div>
                <p className="font-[family-name:var(--font-outfit)] text-sm text-gray-600 mb-4">
                  {t.context}
                </p>
                <pre className="bg-neighbor-cream rounded-2xl p-4 md:p-5 font-[family-name:var(--font-outfit)] text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed border border-neighbor-stone/5">
                  {t.body}
                </pre>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-widest text-neighbor-orange font-bold mb-2">
                Et l&apos;affiche ?
              </p>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl md:text-4xl text-neighbor-stone mb-4">
                Voici l&apos;affiche que Voisinons génère
              </h2>
              <p className="font-[family-name:var(--font-outfit)] text-lg text-gray-700 max-w-xl mx-auto">
                Plutôt que de proposer 8 templates fictifs, voici l&apos;unique affiche A4 PDF
                que l&apos;outil produit — vos infos en surimpression d&apos;une illustration
                pré-designée, avec un QR code pointant vers la page d&apos;inscription.
              </p>
            </div>

            <PosterPreview />

            <div className="text-center mt-10">
              <Link
                href="/creer"
                className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-6 py-3 rounded-full font-[family-name:var(--font-outfit)] font-bold hover:bg-neighbor-stone transition-colors"
              >
                Générer mon affiche
                <span aria-hidden>→</span>
              </Link>
              <p className="text-sm text-gray-500 mt-3 font-[family-name:var(--font-outfit)]">
                Page web + affiche PDF + QR code en 30 secondes — gratuit, sans inscription
              </p>
            </div>
          </div>
        </section>

        <article className="px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-12 font-[family-name:var(--font-outfit)] text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl text-neighbor-stone mb-4">
                Conseils d&apos;impression
              </h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-lg">
                <li>
                  Imprimez le mot pour la boîte aux lettres en{" "}
                  <strong>4 par page A4</strong> (option « 4 sur 1 » de votre imprimante) puis
                  découpez en flyers A6.
                </li>
                <li>
                  Pour le hall d&apos;immeuble, l&apos;affiche A4 PDF générée par Voisinons est
                  prête à imprimer — préférez le 120 g pour qu&apos;elle tienne dans la vitrine.
                </li>
                <li>
                  Évitez l&apos;impression noir &amp; blanc : le QR code et l&apos;orange
                  d&apos;accent perdent en lisibilité.
                </li>
                <li>
                  Si vous prévoyez des invitations en extérieur (boîtes aux lettres en
                  pavillon), plastifiez ou imprimez sur papier pelliculé — un coup de pluie peut
                  effacer le texte en une nuit.
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
