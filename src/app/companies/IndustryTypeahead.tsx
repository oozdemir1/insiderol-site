"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { INDUSTRIES } from "../constants/industries";
import { normalizeSearchText } from "../constants/normalizationUtils";

export default function IndustryTypeahead({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const router = useRouter();

  const sortedIndustries = [...INDUSTRIES].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const [industryId, setIndustryId] = useState<number | null>(
    defaultValue ? Number(defaultValue) : null
  );

  const [search, setSearch] = useState(
    INDUSTRIES.find((industry) => industry.id === industryId)?.name || ""
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;

    setSearch(
      INDUSTRIES.find((industry) => industry.id === industryId)?.name || ""
    );
  }, [industryId]);

  const filteredIndustries =
    search.trim().length === 0
      ? sortedIndustries
      : sortedIndustries.filter((industry) =>
          normalizeSearchText(industry.name).includes(
            normalizeSearchText(search)
          )
        );

  useEffect(() => {
    setHighlightedIndex(filteredIndustries.length > 0 ? 0 : -1);
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

  const selectIndustry = (industry: { id: number; name: string }) => {
    setSearch(industry.name);
    setIndustryId(industry.id);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="industry" value={industryId ?? ""} />

      <input
        ref={inputRef}
        type="text"
        placeholder="Tüm Sektörler"
        value={search}
        onFocus={() => setShowDropdown(true)}
        onChange={(e) => {
          const newText = e.target.value;

          setSearch(newText);
          setShowDropdown(true);

          if (newText.trim() === "") {
            setIndustryId(null);
          }
        }}
        onKeyDown={(e) => {
          if (!filteredIndustries.length) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev < filteredIndustries.length - 1 ? prev + 1 : 0
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();

            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredIndustries.length - 1
            );
          }

          if (e.key === "Escape") {
            setShowDropdown(false);
            setHighlightedIndex(-1);
          }

          if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();

            selectIndustry(filteredIndustries[highlightedIndex]);
          }
        }}
        className="form-field pr-8"

      />

      {industryId !== null ? (
        <button
          type="button"
          onClick={() => {
            setIndustryId(null);
            setSearch("");

            const params = new URLSearchParams(window.location.search);
            params.delete("industry");
            router.push(`/companies?${params.toString()}`);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
        >
          <X size={16} />
        </button>
      ) : (
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
        />
      )}

      {showDropdown && filteredIndustries.length > 0 && (
        <div
          className="
            absolute
            top-full
            left-0
            z-50
            mt-1
            w-[270px]

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
          {filteredIndustries.map((industry, index) => (
            <button
              type="button"
              key={industry.id}
              onClick={() => selectIndustry(industry)}
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
              {industry.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
