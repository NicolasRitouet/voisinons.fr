"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { MairieCombobox, type Mairie } from "./mairie-combobox";
import { SUBJECT, buildBody, buildMailtoHref } from "@/lib/mairies/mail-template";

export function MairieMailBlock() {
  const [mairie, setMairie] = useState<Mairie | null>(null);

  const body = mairie ? buildBody(mairie.n) : "";
  const mailtoHref = mairie ? buildMailtoHref(mairie.e, SUBJECT, body) : "";

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neighbor-stone/5 space-y-6">
      <MairieCombobox onSelect={setMairie} />

      {mairie && (
        <>
          <div className="bg-neighbor-cream rounded-2xl p-4 md:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-[family-name:var(--font-outfit)]">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                Commune
              </p>
              <p className="text-neighbor-stone font-bold">
                {mairie.n} ({mairie.cp})
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                Email
              </p>
              <a
                href={`mailto:${mairie.e}`}
                className="text-neighbor-orange font-bold hover:underline break-all"
              >
                {mairie.e}
              </a>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                Téléphone
              </p>
              {mairie.t ? (
                <a
                  href={`tel:${mairie.t.replace(/\s/g, "")}`}
                  className="text-neighbor-orange font-bold hover:underline"
                >
                  {mairie.t}
                </a>
              ) : (
                <p className="text-gray-400 italic">Non renseigné</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 font-[family-name:var(--font-outfit)]">
            <strong>Avant d&apos;envoyer :</strong> remplacez les éléments entre crochets
            par vos infos perso. Chaque mairie reçoit beaucoup de demandes en mai —
            un mail standardisé risque d&apos;être ignoré.{" "}
            {mairie.t
              ? "Pour les petites communes, un appel téléphonique direct est souvent plus efficace."
              : "Pour les petites communes, un appel téléphonique direct est souvent plus efficace (numéro non renseigné dans l'annuaire ici)."}
          </div>

          <div>
            <p className="font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wide text-gray-500 mb-2">
              Sujet
            </p>
            <pre className="bg-neighbor-cream rounded-xl p-3 font-[family-name:var(--font-outfit)] text-sm text-gray-800 whitespace-pre-wrap border border-neighbor-stone/5 mb-4">
              {SUBJECT}
            </pre>

            <p className="font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wide text-gray-500 mb-2">
              Message
            </p>
            <pre className="bg-neighbor-cream rounded-xl p-4 md:p-5 font-[family-name:var(--font-outfit)] text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed border border-neighbor-stone/5">
              {body}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 bg-neighbor-orange text-white px-5 py-2.5 rounded-full font-[family-name:var(--font-outfit)] font-bold text-sm hover:bg-neighbor-stone transition-colors"
            >
              Ouvrir dans ma messagerie
              <span aria-hidden>→</span>
            </a>
            <CopyButton text={body} label="Copier le message" />
            <CopyButton text={mairie.e} label="Copier l'email" />
          </div>
        </>
      )}

      {!mairie && (
        <p className="text-sm text-gray-500 font-[family-name:var(--font-outfit)] italic">
          Sélectionnez votre commune ci-dessus pour voir l&apos;email officiel de la
          mairie et obtenir un brouillon de mail prérempli.
        </p>
      )}

      <p className="text-xs text-gray-400 font-[family-name:var(--font-outfit)] pt-2 border-t border-neighbor-stone/5">
        Source des données : data.gouv.fr — Annuaire de l&apos;administration
        (Licence Ouverte 2.0). Les emails sont susceptibles d&apos;être obsolètes ;
        en cas d&apos;échec, vérifiez sur{" "}
        <a
          href="https://lannuaire.service-public.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neighbor-orange hover:underline"
        >
          lannuaire.service-public.fr
        </a>
        .
      </p>
    </div>
  );
}
