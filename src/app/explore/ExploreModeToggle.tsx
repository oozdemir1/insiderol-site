"use client";

import { useRouter } from "next/navigation";

type Props = {
  compareMode: boolean;
  compareSubMode: "company" | "role";
};

const SEGMENTS = [
  { label: "Akış", href: "/explore" },
  { label: "Şirket", href: "/explore?mode=compare" },
  { label: "Rol", href: "/explore?mode=compare&compareType=role" },
] as const;

const TRANSLATE_CLASSES = ["translate-x-0", "translate-x-20", "translate-x-40"];

export default function ExploreModeToggle({ compareMode, compareSubMode }: Props) {
  const router = useRouter();

  const activeIndex = !compareMode ? 0 : compareSubMode === "role" ? 2 : 1;

  return (
    <div className="relative flex shrink-0">
      {/* Decorative track + sliding thumb — sized via negative insets so
          neither adds to the row's flow height (same trick as the sticky
          bar's own bottom border below). */}
      <div className="absolute -inset-y-1 inset-x-0 rounded-full border border-black/10 bg-black/5 pointer-events-none" />

      <div
        className={`absolute -inset-y-1 left-0 w-20 rounded-full bg-[var(--surface)] shadow-sm transition-transform duration-300 ease-out ${TRANSLATE_CLASSES[activeIndex]}`}
      />

      {SEGMENTS.map((segment, index) => (
        <button
          key={segment.label}
          type="button"
          onClick={() => router.push(segment.href)}
          className={`relative z-10 flex items-center justify-center w-20 h-5 text-[11px] font-medium whitespace-nowrap transition-colors duration-300 ${
            activeIndex === index ? "text-white" : "text-[var(--muted-dark)]"
          }`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  );
}
