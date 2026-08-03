import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // The root layout already appends "| Voisinons.fr" via its title template.
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neighbor-cream">
      {/* Wall the plate is mounted on */}
      <div
        className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-neighbor-yellow/45 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-36 -right-24 h-[30rem] w-[30rem] rounded-full bg-neighbor-orange/30 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-neighbor-green/20 blur-[100px]"
        aria-hidden="true"
      />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        {/* French enamel street plate: the one sign every neighbour recognises */}
        <div className="reveal">
          <div className="street-plate-tilt street-plate px-8 py-6 sm:px-14 sm:py-8">
            <span className="street-rivet street-rivet--tl" aria-hidden="true" />
            <span className="street-rivet street-rivet--tr" aria-hidden="true" />
            <span className="street-rivet street-rivet--bl" aria-hidden="true" />
            <span className="street-rivet street-rivet--br" aria-hidden="true" />

            <p className="font-[family-name:var(--font-outfit)] text-[0.7rem] font-medium uppercase tracking-[0.32em] text-white/75 sm:text-xs">
              Erreur 404
            </p>
            <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase leading-none tracking-[0.18em] text-white sm:text-3xl">
              Rue
            </p>
            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase leading-none tracking-[0.12em] text-white sm:text-5xl">
              Introuvable
            </p>
          </div>
        </div>

        <p className="reveal delay-100 mt-10 font-[family-name:var(--font-gloria)] text-lg text-neighbor-orange sm:text-xl">
          Personne à cette adresse&nbsp;!
        </p>

        <h1 className="reveal delay-100 mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-neighbor-stone sm:text-4xl">
          Cette page n&apos;existe pas
        </h1>

        <div className="reveal delay-200 mt-8 w-full max-w-md space-y-3 text-left">
          <div className="flex gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xl" aria-hidden="true">
              &#128269;
            </span>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-gray-600">
              Le lien comporte peut-être une coquille. Vérifiez l&apos;adresse
              que l&apos;on vous a partagée.
            </p>
          </div>
          <div className="flex gap-3 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xl" aria-hidden="true">
              &#127881;
            </span>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-gray-600">
              Ou la fête est déjà passée&nbsp;: nous effaçons chaque page{" "}
              <strong className="font-semibold text-neighbor-stone">
                30 jours après l&apos;événement
              </strong>
              , pour ne conserver aucune donnée inutile.
            </p>
          </div>
        </div>

        <div className="reveal delay-300 mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-neighbor-stone px-7 py-3 font-[family-name:var(--font-outfit)] font-semibold text-white transition-colors hover:bg-neighbor-stone/90"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/creer"
            className="rounded-full border-2 border-neighbor-orange px-7 py-3 font-[family-name:var(--font-outfit)] font-semibold text-neighbor-orange transition-colors hover:bg-neighbor-orange hover:text-white"
          >
            Créer ma fête
          </Link>
        </div>

        <p className="reveal delay-300 mt-8 font-[family-name:var(--font-outfit)] text-sm text-gray-500">
          Tant qu&apos;on y est, pourquoi ne pas organiser la vôtre&nbsp;?
        </p>
      </div>
    </main>
  );
}
