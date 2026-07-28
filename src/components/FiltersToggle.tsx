"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

// Tailwind needs literal class strings to pick them up at build time, so
// the breakpoint prop maps through this table rather than being
// interpolated directly into a className.
const HIDE_TOGGLE_CLASS = {
  sm: "sm:hidden",
  md: "md:hidden",
  xl: "xl:hidden",
} as const;

const ALWAYS_SHOW_CLASS = {
  sm: "sm:contents",
  md: "md:contents",
  xl: "xl:contents",
} as const;

export default function FiltersToggle({
  children,
  activeCount,
  breakpoint = "xl",
}: {
  children: React.ReactNode;
  activeCount?: number;
  // The screen width above which filters are always shown (no toggle,
  // no collapsing) - pick the smallest breakpoint that comfortably fits
  // the content in one row without squeezing.
  breakpoint?: "sm" | "md" | "xl";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={HIDE_TOGGLE_CLASS[breakpoint]}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="form-btn form-btn-secondary w-full flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={16} />
          Filtreler{activeCount ? ` (${activeCount})` : ""}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`${
          open ? "flex flex-col" : "hidden"
        } ${ALWAYS_SHOW_CLASS[breakpoint]} gap-2`}
      >
        {children}
      </div>
    </>
  );
}
