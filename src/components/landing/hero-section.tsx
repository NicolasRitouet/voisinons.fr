import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
      {/* Blobs - Reduced on mobile */}
      <div className="blob-bg bg-neighbor-yellow/40 w-48 h-48 sm:w-96 sm:h-96 rounded-full top-0 -left-10 sm:-left-20" />
      <div className="blob-bg bg-neighbor-orange/20 w-64 h-64 sm:w-[30rem] sm:h-[30rem] rounded-full bottom-0 -right-20 sm:-right-40" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Social Proof Pill */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 mb-8 shadow-sm reveal">
          <span className="flex -space-x-2">
            <Image
              className="w-6 h-6 rounded-full border border-white object-cover"
              src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&auto=format&fit=crop"
              alt="Utilisateur"
              width={24}
              height={24}
            />
            <Image
              className="w-6 h-6 rounded-full border border-white object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop"
              alt="Utilisateur"
              width={24}
              height={24}
            />
            <Image
              className="w-6 h-6 rounded-full border border-white object-cover"
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&auto=format&fit=crop"
              alt="Utilisateur"
              width={24}
              height={24}
            />
          </span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide pr-1">
            Rejoignez les premiers testeurs
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter text-neighbor-stone mb-8 reveal delay-100">
          Faites vibrer <br />
          votre{" "}
          <span className="relative inline-block text-neighbor-orange italic pr-4">
            quartier
            <svg
              className="absolute w-full h-3 -bottom-1 left-0 text-neighbor-yellow z-[-1]"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>
          !
        </h1>

        <p className="font-[family-name:var(--font-outfit)] text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed reveal delay-200">
          L&apos;outil gratuit pour organiser la parfaite{" "}
          <span className="font-bold text-neighbor-stone">Fête des Voisins</span>
          . Générez vos affiches, coordonnez les plats, et trouvez de l&apos;aide
          pour vos démarches administratives.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 reveal delay-300">
          <Link
            href="/creer"
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-neighbor-yellow to-neighbor-orange rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <span className="relative flex bg-neighbor-stone text-white rounded-full px-8 py-4 font-bold text-lg tracking-wide hover:bg-neighbor-dark transition-all shadow-xl">
              Créer ma fête
            </span>
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-400 font-[family-name:var(--font-outfit)] reveal delay-300">
          100% Gratuit &bull; Respectueux RGPD &bull; Génération d&apos;affiche
          instantanée
        </p>
      </div>
    </header>
  );
}
