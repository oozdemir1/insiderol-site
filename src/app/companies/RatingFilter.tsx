"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

const RATING_OPTIONS = [
  { value: "", label: "Tüm Puanlar" },
  { value: "4.5", label: "4.5+" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
  { value: "3.0", label: "3.0+" },
];

export default function RatingFilter({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const router = useRouter();

  const [rating, setRating] = useState(defaultValue || "");
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedLabel =
    RATING_OPTIONS.find((option) => option.value === rating)?.label ||
    "Tüm Puanlar";

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="averageRating" value={rating} />

      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="form-field pr-8 text-left"
      >
        <span>{selectedLabel}</span>
      </button>

      {rating ? (
        <button
          type="button"
          onClick={() => {
            setRating("");
            setShowDropdown(false);

            const params = new URLSearchParams(window.location.search);
            params.delete("averageRating");
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

      {showDropdown && (
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
          {RATING_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                setRating(option.value);
                setShowDropdown(false);
              }}
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
                  option.value === rating
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
