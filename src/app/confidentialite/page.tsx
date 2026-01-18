import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Voisinons.fr",
  description: "Politique de confidentialité et protection des données personnelles de Voisinons.fr",
};

export default function ConfidentialitePage() {
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
            Politique de Confidentialité
          </h1>
          <p className="text-white/70 mt-2">Conforme au RGPD</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 space-y-8 font-[family-name:var(--font-outfit)]">

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              1. Responsable du traitement
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le responsable du traitement des données personnelles est :<br /><br />
              <strong>Nicolas Ritouet</strong><br />
              Email : contact@voisinons.fr
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              2. Données collectées
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dans le cadre de l&apos;utilisation de Voisinons.fr, nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Pour les organisateurs :</strong> nom, adresse email, adresse de la fête</li>
              <li><strong>Pour les participants :</strong> nom, adresse email (optionnel), téléphone (optionnel), nombre de personnes, ce qu&apos;ils apportent</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur (logs serveur)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Les coordonnées des participants (email, téléphone) sont visibles uniquement par l&apos;organisateur
              de la fête concernée.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              3. Finalités du traitement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données sont collectées pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Permettre la création et la gestion de pages d&apos;événements</li>
              <li>Permettre aux participants de s&apos;inscrire aux événements</li>
              <li>Permettre à l&apos;organisateur de tenir informés les participants (email/téléphone si fourni)</li>
              <li>Envoyer des emails de confirmation et de rappel (si email fourni)</li>
              <li>Assurer le bon fonctionnement technique du service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Aucune prospection commerciale n&apos;est effectuée à partir des coordonnées collectées.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              4. Base légale du traitement
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Le traitement de vos données repose sur :<br /><br />
              <strong>L&apos;exécution d&apos;un contrat</strong> (Article 6.1.b du RGPD) : le traitement est nécessaire
              pour vous fournir le service demandé (création d&apos;événement, inscription).<br /><br />
              <strong>L&apos;intérêt légitime</strong> (Article 6.1.f du RGPD) : pour les données techniques
              nécessaires au bon fonctionnement et à la sécurité du service.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              5. Durée de conservation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Données des événements :</strong> Les données liées à un événement (organisateur, participants)
              sont automatiquement supprimées <strong>30 jours après la date de l&apos;événement</strong>.<br /><br />
              <strong>Logs techniques :</strong> Conservés pendant 12 mois maximum.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              6. Destinataires des données
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données ne sont jamais vendues ni partagées à des fins commerciales.<br /><br />
              Les seuls destinataires sont :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li><strong>Organisateur de l&apos;événement</strong> : accès aux coordonnées des participants pour tenir informés</li>
              <li><strong>Vercel Inc.</strong> : hébergement du site</li>
              <li><strong>Neon</strong> : hébergement de la base de données</li>
              <li><strong>Resend</strong> : envoi des emails transactionnels</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Voisinons.fr n&apos;utilise jamais les emails ou numéros de téléphone à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              7. Transfert hors UE
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Certains de nos prestataires techniques sont situés aux États-Unis.
              Ces transferts sont encadrés par les Clauses Contractuelles Types (CCT) de la Commission Européenne,
              garantissant un niveau de protection adéquat de vos données.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              8. Vos droits
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@voisinons.fr" className="text-neighbor-orange hover:underline">contact@voisinons.fr</a>
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              9. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Voisinons.fr utilise uniquement des <strong>cookies techniques essentiels</strong> au fonctionnement du site.
              Aucun cookie publicitaire ou de tracking n&apos;est utilisé.<br /><br />
              Le localStorage du navigateur est utilisé pour mémoriser votre inscription à un événement
              et vous permettre de la modifier ultérieurement.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
              10. Réclamation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation,
              vous pouvez introduire une réclamation auprès de la CNIL :<br /><br />
              <strong>Commission Nationale de l&apos;Informatique et des Libertés</strong><br />
              3 Place de Fontenoy, TSA 80715<br />
              75334 Paris Cedex 07<br />
              Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-neighbor-orange hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t">
            Dernière mise à jour : Janvier 2026
          </p>
        </div>
      </div>
    </main>
  );
}
