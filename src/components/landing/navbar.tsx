"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#comment-ca-marche", label: "Comment ça marche ?" },
    { href: "#features", label: "Fonctionnalités" },
    { href: "#rgpd", label: "Confidentialité" },
  ];

  return (
    <nav className="fixed top-0 w-full z-40 px-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 border border-white/40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Voisinons.fr"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full"
          />
          <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl tracking-tight text-neighbor-stone">
            voisinons<span className="text-neighbor-orange">.fr</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8 font-[family-name:var(--font-outfit)] font-medium text-sm text-gray-600">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-neighbor-orange transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* CTA Button */}
          <Link
            href="/creer"
            className="bg-neighbor-stone text-white px-4 sm:px-5 py-2.5 sm:py-2 rounded-full font-[family-name:var(--font-outfit)] font-bold text-sm hover:bg-neighbor-orange transition-colors duration-300 shadow-lg shadow-neighbor-stone/20"
          >
            <span className="hidden sm:inline">Créer une fête</span>
            <span className="sm:hidden">Créer</span>
          </Link>

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-neighbor-stone"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg p-4">
            <div className="flex flex-col gap-2 font-[family-name:var(--font-outfit)] font-medium text-gray-600">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-neighbor-cream hover:text-neighbor-orange transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
