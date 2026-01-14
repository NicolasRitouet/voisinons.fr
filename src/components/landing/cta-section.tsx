import Link from "next/link";

export function CTASection() {
  return (
    <section
      id="creer"
      className="py-24 px-4 bg-neighbor-stone relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-full h-full opacity-5"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
      />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl sm:text-5xl md:text-7xl text-white mb-8 tracking-tighter">
          Tout commence par un <br />
          <span className="text-neighbor-yellow">&quot;Bonjour&quot;</span>
        </h2>
        <p className="text-gray-300 text-lg sm:text-xl font-[family-name:var(--font-outfit)] mb-10 max-w-2xl mx-auto">
          Ne repoussez pas à l&apos;année prochaine. Créez la page de votre rue
          en 30 secondes et imprimez l&apos;affiche ce soir.
        </p>
        <Link
          href="/creer"
          className="inline-block bg-neighbor-orange text-white px-10 py-5 rounded-xl font-bold font-[family-name:var(--font-space-grotesk)] text-xl hover:bg-orange-600 hover:scale-105 transition-all shadow-lg shadow-orange-900/20"
        >
          Créer ma fête
        </Link>
        <p className="mt-4 text-white/40 text-sm font-[family-name:var(--font-gloria)]">
          Aucune inscription requise pour commencer
        </p>
      </div>
    </section>
  );
}
