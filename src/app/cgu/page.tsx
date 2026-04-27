import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - Voisinons.fr",
  description: "Conditions générales d'utilisation du service Voisinons.fr",
  robots: { index: false, follow: true },
};

export default function CGUPage() {
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
            Conditions Générales d&apos;Utilisation
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 space-y-8 font-[family-name:var(--font-outfit)]">

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              1. Objet
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation
              du service Voisinons.fr, une plateforme gratuite permettant d&apos;organiser des fêtes
              de voisins et événements de quartier.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              L&apos;utilisation du service implique l&apos;acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              2. Description du service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Voisinons.fr propose les fonctionnalités suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Création de pages d&apos;événements avec une URL personnalisée</li>
              <li>Génération d&apos;affiches PDF avec QR code</li>
              <li>Gestion des inscriptions des participants</li>
              <li>Coordination des contributions (ce que chacun apporte)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Le service est fourni gratuitement, sans création de compte obligatoire.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              3. Accès au service
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le service est accessible gratuitement à tout utilisateur disposant d&apos;un accès Internet.
              L&apos;éditeur se réserve le droit de suspendre ou d&apos;interrompre le service pour maintenance
              ou mise à jour, sans préavis ni indemnité.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              4. Obligations des utilisateurs
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En utilisant Voisinons.fr, vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Fournir des informations exactes et à jour</li>
              <li>Utiliser le service de manière loyale et dans le respect des lois en vigueur</li>
              <li>Ne pas utiliser le service à des fins illicites ou commerciales non autorisées</li>
              <li>Ne pas porter atteinte à la sécurité ou au bon fonctionnement du service</li>
              <li>Respecter les droits des autres utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              5. Responsabilité des organisateurs
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les organisateurs d&apos;événements sont seuls responsables :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>De l&apos;organisation et du bon déroulement de leur événement</li>
              <li>Des autorisations nécessaires (mairie, copropriété, etc.)</li>
              <li>De la conformité de l&apos;événement aux réglementations locales</li>
              <li>De la sécurité des participants</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Voisinons.fr n&apos;est qu&apos;un outil de facilitation et ne saurait être tenu responsable
              des événements organisés via la plateforme.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              6. Contenu utilisateur
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les utilisateurs sont responsables du contenu qu&apos;ils publient (nom d&apos;événement,
              description, etc.). Il est interdit de publier du contenu :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Illicite, diffamatoire, injurieux ou discriminatoire</li>
              <li>Portant atteinte aux droits de tiers (propriété intellectuelle, vie privée)</li>
              <li>À caractère publicitaire ou commercial non autorisé</li>
              <li>Contenant des virus ou code malveillant</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              L&apos;éditeur se réserve le droit de supprimer tout contenu contrevenant aux présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              7. Limitation de responsabilité
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le service est fourni &quot;en l&apos;état&quot;, sans garantie d&apos;aucune sorte.
              L&apos;éditeur ne saurait être tenu responsable :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Des interruptions ou dysfonctionnements du service</li>
              <li>De la perte de données</li>
              <li>Des dommages directs ou indirects résultant de l&apos;utilisation du service</li>
              <li>Du comportement des utilisateurs ou du déroulement des événements</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              8. Suppression des données
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Conformément à notre politique de confidentialité, les données des événements
              sont automatiquement supprimées 30 jours après la date de l&apos;événement.<br /><br />
              Les organisateurs peuvent demander la suppression anticipée de leur événement
              en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              9. Propriété intellectuelle
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le service Voisinons.fr, son design, ses fonctionnalités et son code source sont
              la propriété de l&apos;éditeur. Toute reproduction ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              10. Modification des CGU
            </h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés des modifications significatives.
              L&apos;utilisation continue du service après modification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              11. Droit applicable et litiges
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Les présentes CGU sont soumises au droit français.<br /><br />
              En cas de litige, les parties s&apos;engagent à rechercher une solution amiable avant
              toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              12. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant ces CGU :<br />
              <a href="mailto:contact@voisinons.fr" className="text-neighbor-orange hover:underline">contact@voisinons.fr</a>
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
