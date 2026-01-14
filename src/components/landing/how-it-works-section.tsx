import Link from "next/link";

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-24 px-4 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-[family-name:var(--font-gloria)] text-neighbor-orange text-xl font-bold rotate-2 inline-block mb-2">
            C&apos;est simple comme bonjour
          </span>
          <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl sm:text-4xl md:text-5xl text-neighbor-stone">
            Tout pour organiser sans stress
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,auto)]">
          {/* Card 1: Create Space */}
          <div className="bg-neighbor-cream rounded-3xl p-8 border border-stone-100 flex flex-col justify-between group hover:border-neighbor-yellow transition-all duration-300 min-h-[300px] md:min-h-[400px]">
            <div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-stone-100">
                <span role="img" aria-label="Lien">
                  &#128279;
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-2">
                1. Créez votre espace
              </h3>
              <p className="font-[family-name:var(--font-outfit)] text-gray-600">
                Obtenez une URL unique (ex:{" "}
                <em className="bg-yellow-200 px-1">voisinons.fr/residence-bleue</em>
                ) pour centraliser toutes les infos de votre fête.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 translate-y-4 group-hover:translate-y-2 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs">
                  &#10004;
                </div>
                <div className="text-sm font-bold text-gray-800">
                  Page créée avec succès !
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Poster Generator (Main Focus) */}
          <div className="md:col-span-2 bg-neighbor-stone rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 text-white min-h-[300px] md:min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neighbor-orange rounded-full filter blur-[80px] opacity-30" />

            <div className="flex-1 z-10">
              <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl mb-4">
                2. Une affiche prête à imprimer
              </h3>
              <p className="font-[family-name:var(--font-outfit)] text-gray-300 text-lg mb-6">
                Fini le feutre. Nous générons automatiquement une affiche
                magnifique avec un QR Code unique pour votre hall d&apos;immeuble.
              </p>
              <div className="flex gap-2 font-[family-name:var(--font-gloria)] text-neighbor-yellow">
                <span>&#10024; Magique</span>
                <span>&bull;</span>
                <span>&#128424; PDF HD</span>
              </div>
            </div>

            {/* The Poster Visual */}
            <div className="relative w-36 sm:w-48 md:w-56 shrink-0">
              <div className="poster-card w-full aspect-[1/1.4] bg-white p-3 flex flex-col items-center text-center">
                <div className="tape-effect" />
                <div className="w-full h-full border-2 border-stone-900 p-2 flex flex-col">
                  <h4 className="font-[family-name:var(--font-space-grotesk)] font-bold text-stone-900 text-xl leading-none mt-2">
                    FÊTE
                    <br />
                    DES
                    <br />
                    VOISINS
                  </h4>
                  <div className="my-auto">
                    <div className="text-[10px] font-bold text-neighbor-orange uppercase">
                      Vendredi 24 Mai
                    </div>
                    <div className="text-[8px] text-gray-500 mt-1">
                      Cour intérieure
                    </div>
                    <div className="w-16 h-16 bg-black mx-auto mt-2" />
                  </div>
                  <div className="text-[8px] font-bold mt-auto mb-1 text-neighbor-stone">
                    Scannez pour participer
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Logistics */}
          <div className="md:col-span-2 bg-neighbor-green/10 rounded-3xl p-8 md:p-12 border border-neighbor-green/20 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[280px] md:min-h-[360px]">
            <div className="flex-1">
              <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-2">
                3. &quot;Qui ramène les chips ?&quot;
              </h3>
              <p className="font-[family-name:var(--font-outfit)] text-gray-600 mb-4">
                Plus de doublons. Chaque voisin indique ce qu&apos;il apporte
                (boissons, plats, chaises). Les organisateurs ont une vue
                d&apos;ensemble claire.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-neighbor-green">&#10003;</span> Chat &amp;
                  Annonces en direct
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-neighbor-green">&#10003;</span> Liste des
                  participants
                </li>
              </ul>
            </div>
            {/* UI Snippet */}
            <div className="w-full max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 p-4 font-[family-name:var(--font-outfit)] text-sm rotate-1">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <span className="font-bold text-gray-800">Liste des courses</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  En cours
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                    J
                  </div>
                  <span className="text-gray-600">
                    Jules apporte{" "}
                    <span className="font-bold text-gray-800">Quiche</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-6 h-6 border rounded-full text-gray-400 flex items-center justify-center text-xs">
                    +
                  </div>
                  <span className="text-gray-400 italic">Ajouter un item...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Administrative Help */}
          <div className="bg-neighbor-blue/10 rounded-3xl p-8 border border-neighbor-blue/20 flex flex-col min-h-[280px] md:min-h-[360px]">
            <div className="w-12 h-12 bg-white text-neighbor-blue rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">
              <span role="img" aria-label="Mairie">
                &#127963;
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-blue mb-2">
              Aide Administrative
            </h3>
            <p className="font-[family-name:var(--font-outfit)] text-gray-600 mb-6 grow">
              Besoin de fermer la rue ? De louer des tables à la mairie ? Nous vous
              fournissons les modèles de lettres et les contacts utiles pour
              faciliter vos démarches officielles.
            </p>
            <Link
              href="#"
              className="inline-flex items-center text-sm font-bold text-neighbor-blue hover:underline"
            >
              Télécharger les modèles{" "}
              <span className="ml-2 text-xs">&rarr;</span>
            </Link>
          </div>

          {/* Card 5: Privacy (Full Width Strip) */}
          <div
            id="rgpd"
            className="md:col-span-3 bg-white rounded-3xl p-6 border border-stone-100 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left mt-2"
          >
            <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center text-xl shrink-0">
              <span role="img" aria-label="Bouclier">
                &#128737;
              </span>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg text-neighbor-stone">
                Safe &amp; Privé
              </h4>
              <p className="font-[family-name:var(--font-outfit)] text-sm text-gray-500 max-w-2xl">
                Pas de compte obligatoire. Pas de revente de données. Tout est
                supprimé 30 jours après la fête. Conforme RGPD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
