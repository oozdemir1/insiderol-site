"use client";

import { useRouter } from "next/navigation";

type Props = {
  compareMode: boolean;
};

export default function ExploreModeToggle({ compareMode }: Props) {
  const router = useRouter();

  return (
    <div className="relative flex shrink-0">
      {/* Decorative track + sliding thumb — sized via negative insets so
          neither adds to the row's flow height (same trick as the sticky
          bar's own bottom border below). */}
      <div className="absolute -inset-y-1 inset-x-0 rounded-full border border-black/10 bg-black/5 pointer-events-none" />

      <div
        className={`absolute -inset-y-1 left-0 w-20 rounded-full bg-[var(--surface)] shadow-sm transition-transform duration-300 ease-out ${
          compareMode ? "translate-x-20" : "translate-x-0"
        }`}
      />

      <button
        type="button"
        onClick={() => router.push("/explore")}
        className={`relative z-10 flex items-center justify-center w-20 h-5 text-[11px] font-medium transition-colors duration-300 ${
          compareMode ? "text-[var(--muted-dark)]" : "text-white"
        }`}
      >
        Akış
      </button>

      <button
        type="button"
        onClick={() => router.push("/explore?mode=compare")}
        className={`relative z-10 flex items-center justify-center w-20 h-5 text-[11px] font-medium transition-colors duration-300 ${
          compareMode ? "text-white" : "text-[var(--muted-dark)]"
        }`}
      >
        Karşılaştır
      </button>
    </div>
  );
}
