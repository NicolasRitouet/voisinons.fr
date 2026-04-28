import Link from "next/link";

export function MairieAstuce() {
  return (
    <aside className="mt-6 bg-neighbor-blue/10 border border-neighbor-blue/20 rounded-2xl p-5 md:p-6">
      <p className="font-[family-name:var(--font-outfit)] text-sm uppercase tracking-wider text-neighbor-blue font-bold mb-2">
        💡 Astuce Voisinons
      </p>
      <p className="text-base md:text-lg">
        Pas besoin de chercher l&apos;email de votre mairie : Voisinons est
        connecté à l&apos;Annuaire officiel des{" "}
        <strong>34&nbsp;000 mairies</strong> françaises et vous fournit un
        brouillon de demande de kit prérempli en 30 secondes.{" "}
        <Link
          href="/kit-fete-des-voisins-2026"
          className="text-neighbor-blue font-bold hover:underline"
        >
          Trouver ma mairie →
        </Link>
      </p>
    </aside>
  );
}
