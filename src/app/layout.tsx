import type { Metadata } from "next";
import { Space_Grotesk, Outfit, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const gloria = Gloria_Hallelujah({
  variable: "--font-gloria",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Voisinons.fr | Organisez votre Fête des Voisins simplement",
  description:
    "L'outil gratuit pour organiser la parfaite Fête des Voisins. Générez vos affiches, coordonnez les plats, et trouvez de l'aide pour vos démarches administratives.",
  keywords: [
    "fête des voisins",
    "fête de quartier",
    "voisins",
    "organisation",
    "affiche",
    "QR code",
  ],
  openGraph: {
    title: "Voisinons.fr | Organisez votre Fête des Voisins simplement",
    description:
      "L'outil gratuit pour organiser la parfaite Fête des Voisins. Générez vos affiches, coordonnez les plats, et trouvez de l'aide pour vos démarches administratives.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${outfit.variable} ${gloria.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
