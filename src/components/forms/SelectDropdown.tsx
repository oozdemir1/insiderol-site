"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export type SelectOption<T extends number | string = number | string> = {
  value: T;
  label: string;
};

type Props<T extends number | string> = {
  value: T | null;
  onChange: (value: T | null) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
};

export default function SelectDropdown<T extends number | string>({
  value,
  onChange,
  options,
  placeholder = "Seç",
  className,
}: Props<T>) {
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

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className={`form-field flex items-center justify-between gap-2 text-left ${
          className || ""
        }`}
      >
        <span className={selected ? "" : "text-[var(--muted-dark)]"}>
          {selected ? selected.label : placeholder}
        </span>

        {selected ? (
          <span
            role="button"
            aria-label="Temizle"
            onClick={(e) => {
              // Clearing shouldn't also toggle the dropdown open —
              // this sits inside the trigger button, not beside it.
              e.stopPropagation();
              onChange(null);
              setShowDropdown(false);
            }}
            className="shrink-0 text-black/40 hover:text-black/70"
          >
            <X size={16} />
          </span>
        ) : (
          <ChevronDown size={16} className="shrink-0 text-black/40" />
        )}
      </button>

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
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
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
                  option.value === value
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
