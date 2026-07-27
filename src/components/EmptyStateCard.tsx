import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function EmptyStateCard({
  icon: Icon,
  title,
  body,
  ctaLabel,
  ctaHref,
  tone = "light",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "light" | "dark";
}) {
  if (tone === "dark") {
    return (
      <div className="max-w-lg mx-auto text-center px-8 py-12 rounded-[1.75rem] border border-white/10 bg-[var(--card-green)]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
          <Icon size={28} />
        </div>

        <h3 className="text-xl font-bold text-white">{title}</h3>

        <p className="mt-2.5 text-white/75 leading-7">{body}</p>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-white text-[var(--card-green)] font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          {ctaLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center px-8 py-12 rounded-[1.75rem] border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/[0.035]">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
        <Icon size={28} />
      </div>

      <h3 className="text-xl font-bold text-[var(--text-dark)]">{title}</h3>

      <p className="mt-2.5 text-[var(--muted-dark)] leading-7">{body}</p>

      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
