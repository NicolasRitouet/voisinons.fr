export function ContextSection() {
  return (
    <section className="py-16 px-4 bg-neighbor-cream border-t border-stone-100">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-3xl mb-6 text-neighbor-stone">
          Une initiative citoyenne
        </h2>
        <p className="font-[family-name:var(--font-outfit)] text-gray-700 text-lg mb-8">
          Voisinons.fr est un outil indépendant créé pour faciliter
          l&apos;organisation locale. Pour retrouver les dates officielles, les
          kits de communication nationaux et l&apos;historique de cet événement
          magnifique, visitez le site officiel.
        </p>
        <a
          href="https://fetedesvoisins.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-neighbor-orange font-bold font-[family-name:var(--font-space-grotesk)] hover:underline underline-offset-4"
        >
          Voir le site officiel fetedesvoisins.fr{" "}
          <span className="text-xs">&#8599;</span>
        </a>
      </div>
    </section>
  );
}
