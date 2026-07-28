"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function FiltersToggle({
  children,
  activeCount,
}: {
  children: React.ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="xl:hidden">
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
        } xl:contents gap-2`}
      >
        {children}
      </div>
    </>
  );
}
