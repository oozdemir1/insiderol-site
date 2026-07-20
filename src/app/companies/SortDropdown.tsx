"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "", label: "Alfabetik (A-Z)" },
  { value: "newest", label: "Son Eklenenler" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "reviews", label: "En Çok Yorum" },
  { value: "salary", label: "En Yüksek Maaş Ortalaması" },
  { value: "salaryCount", label: "En Çok Maaş Verisi" },
];

type Props = {
  sort: string;
};

export default function SortDropdown({
  sort,
}: Props) {
  const router = useRouter();

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
    SORT_OPTIONS.find((option) => option.value === sort)?.label ||
    "Alfabetik (A-Z)";

  const selectSort = (value: string) => {
    const params = new URLSearchParams(window.location.search);

    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    router.push(`/companies?${params.toString()}`);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="form-field !w-[200px] flex items-center justify-between gap-2"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className="shrink-0 text-black/40" />
      </button>

      {showDropdown && (
        <div
          className="
            absolute
            top-full
            left-0
            z-50
            mt-1
            w-[200px]

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
          {SORT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => selectSort(option.value)}
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
                  option.value === sort
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
