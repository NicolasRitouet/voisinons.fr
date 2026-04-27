import Link from "next/link";
import Image from "next/image";

export function ContentPageHeader() {
  return (
    <nav className="sticky top-0 z-40 bg-neighbor-cream/85 backdrop-blur-md border-b border-neighbor-stone/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Voisinons.fr"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg tracking-tight text-neighbor-stone">
            voisinons<span className="text-neighbor-orange">.fr</span>
          </span>
        </Link>
        <Link
          href="/creer"
          className="bg-neighbor-stone text-white px-4 sm:px-5 py-2 rounded-full font-[family-name:var(--font-outfit)] font-bold text-sm hover:bg-neighbor-orange transition-colors duration-300 shadow-sm"
        >
          <span className="hidden sm:inline">Créer ma fête</span>
          <span className="sm:hidden">Créer</span>
        </Link>
      </div>
    </nav>
  );
}
