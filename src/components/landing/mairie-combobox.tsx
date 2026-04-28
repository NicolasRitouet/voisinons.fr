"use client";

import { useEffect, useRef, useState } from "react";

export type Mairie = {
  /** Code INSEE */
  i: string;
  /** Nom de la commune */
  n: string;
  /** Code postal principal */
  cp: string;
  /** Email de la mairie */
  e: string;
  /** Téléphone de la mairie (optionnel) */
  t: string | null;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; results: Mairie[] }
  | { status: "error"; message: string };

const SEARCH_URL = "/api/mairies/search";
const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

export function MairieCombobox({
  onSelect,
  placeholder = "Tapez le nom de votre commune…",
}: {
  onSelect: (m: Mairie) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setFetchState({ status: "idle" });
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setFetchState({ status: "loading" });
      try {
        const res = await fetch(
          `${SEARCH_URL}?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { results: Mairie[] };
        setFetchState({ status: "ready", results: data.results });
        setActiveIndex(0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        setFetchState({ status: "error", message: msg });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
      abortRef.current?.abort();
    };
  }, [query]);

  const results = fetchState.status === "ready" ? fetchState.results : [];

  function handleSelect(mairie: Mairie) {
    setQuery(`${mairie.n} (${mairie.cp})`);
    setOpen(false);
    onSelect(mairie);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const trimmedQuery = query.trim();
  const showEmpty =
    fetchState.status === "ready" &&
    trimmedQuery.length >= MIN_QUERY_LENGTH &&
    results.length === 0;

  return (
    <div className="relative">
      <label className="block font-[family-name:var(--font-outfit)] text-sm font-bold text-neighbor-stone mb-2">
        Votre commune
      </label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on a list item still registers
          setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="mairie-listbox"
        className="w-full px-4 py-3 rounded-2xl border border-neighbor-stone/15 bg-white font-[family-name:var(--font-outfit)] text-neighbor-stone placeholder:text-gray-400 focus:outline-none focus:border-neighbor-orange focus:ring-2 focus:ring-neighbor-orange/20 transition-colors"
      />

      {open && trimmedQuery.length >= MIN_QUERY_LENGTH && (
        <ul
          id="mairie-listbox"
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-neighbor-stone/10 max-h-80 overflow-y-auto font-[family-name:var(--font-outfit)]"
        >
          {fetchState.status === "loading" && (
            <li className="px-4 py-3 text-sm text-gray-500">Recherche…</li>
          )}
          {fetchState.status === "error" && (
            <li className="px-4 py-3 text-sm text-red-600">
              Impossible de charger les résultats ({fetchState.message}).
            </li>
          )}
          {showEmpty && (
            <li className="px-4 py-3 text-sm text-gray-500">
              Aucune commune avec email dans l&apos;annuaire officiel.{" "}
              <a
                href={`https://lannuaire.service-public.fr/recherche?q=${encodeURIComponent(
                  trimmedQuery
                )}&category=mairie`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neighbor-orange hover:underline"
              >
                Voir sur lannuaire.service-public.fr ↗
              </a>
            </li>
          )}
          {results.map((m, i) => (
            <li key={m.i} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                }}
                onClick={() => handleSelect(m)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center gap-3 transition-colors ${
                  i === activeIndex
                    ? "bg-neighbor-cream text-neighbor-stone"
                    : "text-gray-700 hover:bg-neighbor-cream"
                }`}
              >
                <span className="font-medium">{m.n}</span>
                <span className="text-gray-400 text-xs">{m.cp}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
