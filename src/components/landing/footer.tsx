import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neighbor-dark text-white py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image
              src="/logo.jpg"
              alt="Voisinons.fr"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full"
            />
            <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg">
              voisinons.fr
            </span>
          </Link>
          <p className="text-gray-400 text-sm font-[family-name:var(--font-outfit)] max-w-sm">
            Fait avec &#10084; pour des quartiers plus vivants. Un outil gratuit
            pour reconnecter les voisins entre eux.
          </p>
        </div>

        <div>
          <h4 className="font-bold font-[family-name:var(--font-space-grotesk)] mb-4 text-gray-200">
            Ressources
          </h4>
          <ul className="space-y-2 text-sm text-gray-400 font-[family-name:var(--font-outfit)]">
            <li>
              <Link
                href="/fete-des-voisins-2026"
                className="hover:text-neighbor-orange"
              >
                Date Fête des Voisins 2026
              </Link>
            </li>
            <li>
              <Link
                href="/kit-fete-des-voisins-2026"
                className="hover:text-neighbor-orange"
              >
                Kit Fête des Voisins
              </Link>
            </li>
            <li>
              <Link
                href="/guide-fete-des-voisins-2026"
                className="hover:text-neighbor-orange"
              >
                Guide d&apos;organisation
              </Link>
            </li>
            <li>
              <Link
                href="/modeles-invitation"
                className="hover:text-neighbor-orange"
              >
                Modèles d&apos;invitation
              </Link>
            </li>
            <li>
              <Link href="/creer" className="hover:text-neighbor-orange">
                Créer ma fête
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold font-[family-name:var(--font-space-grotesk)] mb-4 text-gray-200">
            Légal
          </h4>
          <ul className="space-y-2 text-sm text-gray-400 font-[family-name:var(--font-outfit)]">
            <li>
              <Link
                href="/mentions-legales"
                className="hover:text-neighbor-orange"
              >
                Mentions Légales
              </Link>
            </li>
            <li>
              <Link
                href="/confidentialite"
                className="hover:text-neighbor-orange"
              >
                Politique de confidentialité (RGPD)
              </Link>
            </li>
            <li>
              <Link href="/cgu" className="hover:text-neighbor-orange">
                CGU
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold font-[family-name:var(--font-space-grotesk)] mb-4 text-gray-200">
            Liens utiles
          </h4>
          <ul className="space-y-2 text-sm text-gray-400 font-[family-name:var(--font-outfit)]">
            <li>
              <a
                href="https://fetedesvoisins.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neighbor-orange"
              >
                Site Officiel
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@voisinons.fr"
                className="hover:text-neighbor-orange"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center md:text-left text-xs text-gray-500 font-[family-name:var(--font-outfit)] flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {currentYear} Voisinons.fr. Tous droits réservés.</p>
        <p className="mt-2 md:mt-0">Fait avec &#10084; pour les voisins</p>
      </div>
    </footer>
  );
}
