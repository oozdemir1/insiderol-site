"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { turkishCities } from "@/app/constants/turkishCities";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;

  // Fires on blur — true when the typed text doesn't resolve to a real
  // city (and isn't empty), false otherwise. Lets the parent form show
  // a more specific "invalid" message instead of just "required", since
  // this component intentionally leaves the typed text in place rather
  // than silently clearing it.
  onInvalidChange?: (invalid: boolean) => void;

  // Extra classes merged onto the input, e.g. an error-state border.
  className?: string;

  placeholder?: string;

  // Shows a chevron on the right, matching SelectDropdown's look —
  // opt-in since the companies-page filter usage (where "Tüm Şehirler"
  // reads as a real "no filter" option) doesn't want it.
  showChevron?: boolean;
};

export default function TurkishCitySelect({
  value,
  onChange,
  onInvalidChange,
  className,
  placeholder = "Tüm Şehirler",
  showChevron = false,
}: Props) {

  const sortedCities = [...turkishCities].sort(
    (a, b) => a.name.localeCompare(b.name, "tr")
  );

  const [search, setSearch] = useState(
    turkishCities.find((city) => city.id === value)?.name || ""
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const [highlightedIndex, setHighlightedIndex] =
    useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the visible text in sync with `value` when it changes from
  // outside (draft restore, edit mode, a form reset after submit) —
  // but never while the field is focused, or this would fight every
  // keystroke's onChange(null) below and erase what's being typed.
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;

    setSearch(
      turkishCities.find((city) => city.id === value)?.name || ""
    );
  }, [value]);

  const filteredCities =
    search.trim().length === 0
      ? sortedCities
      : sortedCities.filter((city) =>
          normalizeSearchText(city.name).includes(
            normalizeSearchText(search)
          )
        );

  useEffect(() => {
    setHighlightedIndex(filteredCities.length > 0 ? 0 : -1);
  }, [search]);

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const selectCity = (city: { id: number; name: string }) => {
    setSearch(city.name);
    onChange(city.id);
    setShowDropdown(false);
    onInvalidChange?.(false);
  };

  return (
    <div ref={containerRef} className="relative">

      <input

        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={search}
        onFocus={() => {
          setShowDropdown(true);
          onInvalidChange?.(false);
        }}
        onChange={(e) => {
          const newText = e.target.value;

          setSearch(newText);
          setShowDropdown(true);
          onInvalidChange?.(false);

          // Only clear the resolved value once the field is emptied —
          // otherwise every keystroke while replacing a selection would
          // null it out mid-edit.
          if (newText.trim() === "") {
            onChange(null);
          }
        }}
        onBlur={() => {
          const trimmed = search.trim();

          if (trimmed === "") {
            onInvalidChange?.(false);
            return;
          }

          const exactMatch = sortedCities.find(
            (city) =>
              normalizeSearchText(city.name) ===
              normalizeSearchText(trimmed)
          );

          if (exactMatch) {
            selectCity(exactMatch);
            return;
          }

          // Typed text doesn't resolve to a real city — leave it as-is
          // (don't silently clear what the user typed) but make sure
          // the resolved value is null, and let the parent know so it
          // can show a specific "invalid" message instead of "required".
          onChange(null);
          onInvalidChange?.(true);
        }}
        onKeyDown={(e) => {

          if (!filteredCities.length) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev < filteredCities.length - 1
                ? prev + 1
                : 0
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev > 0
                ? prev - 1
                : filteredCities.length - 1
            );
          }

          if (e.key === "Escape") {
            setShowDropdown(false);
            setHighlightedIndex(-1);
          }

          if (
            e.key === "Enter" &&
            highlightedIndex >= 0
          ) {
            e.preventDefault();

            selectCity(filteredCities[highlightedIndex]);
          }
        }}
        className={`form-field placeholder:!text-[var(--text-dark)] ${
          showChevron ? "pr-10" : ""
        } ${className || ""}`}
      />

      {showChevron && (
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
        />
      )}

      {showDropdown && filteredCities.length > 0 && (
        <div
          className="
            absolute
            top-full
            left-0
            z-50
            mt-1
            w-full

            max-h-64
            overflow-y-auto
            overflow-x-hidden

            rounded-md

            border border-[var(--border)]

            bg-[var(--surface)]

            p-0

            text-white

            shadow-2xl

            transition-all duration-200
          "
        >
          {filteredCities.map((city, index) => (
            <button
              type="button"
              key={city.id}
              onClick={() => selectCity(city)}
              className={`
                w-full
                border-b border-black/5
                px-4 py-1.5
                text-left
                text-sm
                text-white/90
                transition
                last:border-0
                ${
                  highlightedIndex === index
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }
              `}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
