"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AddressSuggestion {
  label: string;
  context: string;
  name: string;
  postcode: string;
  city: string;
  street: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Commencez à taper une adresse...",
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions from API
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await response.json();

        const results: AddressSuggestion[] = data.features.map((feature: {
          properties: {
            label: string;
            context: string;
            name: string;
            postcode: string;
            city: string;
            street?: string;
          };
          geometry: {
            coordinates: [number, number];
          };
        }) => ({
          label: feature.properties.label,
          context: feature.properties.context,
          name: feature.properties.name,
          postcode: feature.properties.postcode,
          city: feature.properties.city,
          street: feature.properties.street || feature.properties.name,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
        }));

        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.label);
    onSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-neighbor-orange rounded-full animate-spin" />
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.label}-${index}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "px-3 py-3 cursor-pointer text-sm",
                highlightedIndex === index
                  ? "bg-neighbor-cream text-neighbor-stone"
                  : "hover:bg-gray-50"
              )}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-xs text-gray-500">
                {suggestion.postcode} {suggestion.city}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
