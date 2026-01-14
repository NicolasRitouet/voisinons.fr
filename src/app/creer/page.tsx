import { Metadata } from "next";
import Link from "next/link";
import { CreatePartyForm } from "@/components/create-party-form";

export const metadata: Metadata = {
  title: "Créer une fête | Voisinons.fr",
  description: "Créez votre fête des voisins en quelques clics",
};

export default function CreatePartyPage() {
  return (
    <main className="min-h-screen bg-neighbor-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-neighbor-stone hover:text-neighbor-orange transition-colors text-sm font-medium"
          >
            &larr; Retour à l&apos;accueil
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl text-neighbor-stone mb-4">
            Créer votre fête
          </h1>
          <p className="font-[family-name:var(--font-outfit)] text-gray-600">
            Remplissez les informations ci-dessous pour créer la page de votre fête des voisins
          </p>
        </div>

        <CreatePartyForm />
      </div>
    </main>
  );
}
