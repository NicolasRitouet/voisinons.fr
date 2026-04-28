import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales du site Voisinons.fr",
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-neighbor-cream">
      {/* Header */}
      <header className="bg-neighbor-stone text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="text-neighbor-yellow hover:underline text-sm mb-4 inline-block"
          >
            &larr; Retour à l&apos;accueil
          </Link>
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl md:text-4xl">
            Mentions Légales
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 space-y-8 font-[family-name:var(--font-outfit)]">

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              1. Éditeur du site
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le site <strong>voisinons.fr</strong> est édité par :<br /><br />
              <strong>Nicolas Ritouet</strong><br />
              Entrepreneur individuel<br />
              Email : contact@voisinons.fr<br /><br />
              Directeur de la publication : Nicolas Ritouet
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              2. Hébergement
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le site est hébergé par :<br /><br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723, États-Unis<br />
              Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-neighbor-orange hover:underline">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              3. Propriété intellectuelle
            </h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.)
              est la propriété exclusive de l&apos;éditeur, à l&apos;exception des marques, logos ou
              contenus appartenant à d&apos;autres sociétés partenaires ou auteurs.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication,
              même partielle, de ces différents éléments est strictement interdite sans l&apos;accord
              exprès par écrit de l&apos;éditeur.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              4. Responsabilité
            </h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que possible.
              Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des
              carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers
              partenaires qui lui fournissent ces informations.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Le site Voisinons.fr est un outil facilitant l&apos;organisation de fêtes de voisins.
              L&apos;éditeur ne saurait être tenu responsable des événements organisés via la plateforme,
              ni des interactions entre utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              5. Liens hypertextes
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le site peut contenir des liens hypertextes vers d&apos;autres sites. L&apos;éditeur
              n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à
              leur contenu.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              6. Droit applicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              7. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à
              l&apos;adresse : <a href="mailto:contact@voisinons.fr" className="text-neighbor-orange hover:underline">contact@voisinons.fr</a>
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t">
            Dernière mise à jour : Janvier 2025
          </p>
        </div>
      </div>
    </main>
  );
}
