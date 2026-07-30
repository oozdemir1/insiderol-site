"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { roundStatCount } from "@/app/constants/roundStatCount";

function StatRing({
  count,
  offset,
  circumference,
  radius,
  strokeWidth,
  label,
}: {
  count: number;
  offset: number;
  circumference: number;
  radius: number;
  strokeWidth: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-[120px]">
      <div className="relative w-[200px] h-[200px]">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${
            radius * 2 + strokeWidth * 2
          }`}
        >
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
          <circle
            className="stats-circle transition-all duration-200"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold text-[var(--text-dark)]">
          {count}+
        </div>
      </div>
      <p className="mt-4 text-center text-base md:text-xl text-[var(--muted-dark)]">
        {label}
      </p>
    </div>
  );
}

function InviteRing({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center min-w-[120px] group"
    >
      <div className="w-[200px] h-[200px] rounded-full border-2 border-dashed border-[var(--accent)]/35 bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/10">
        <Plus size={30} />
      </div>
      <p className="mt-4 text-center text-base md:text-xl text-[var(--muted-dark)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
        İlk sen paylaş →
      </p>
    </Link>
  );
}

export default function StatsSection({
  totalSubmissionCount,
  salaryCount,
  reviewCount,
}: {
  totalSubmissionCount: number;
  salaryCount: number;
  reviewCount: number;
}) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPercent((prev) => (prev < 100 ? prev + 2 : prev));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const radius = 65;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  return (
    <section className="bg-[var(--section-light)] py-28 px-4">
      <div className="text-center mb-14 px-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
          Bugüne kadar
        </h2>

        <p className="text-[var(--muted-dark)] text-lg mt-5 leading-8 max-w-2xl mx-auto">
          Gerçek çalışan verileriyle maaşları, şirket kültürünü ve iş deneyimlerini keşfedin.
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-12 flex-wrap">
        <StatRing
          count={roundStatCount(totalSubmissionCount)}
          offset={offset}
          circumference={circumference}
          radius={radius}
          strokeWidth={strokeWidth}
          label="Toplam paylaşım"
        />

        {salaryCount > 0 ? (
          <StatRing
            count={roundStatCount(salaryCount)}
            offset={offset}
            circumference={circumference}
            radius={radius}
            strokeWidth={strokeWidth}
            label="Maaş paylaşımı"
          />
        ) : (
          <InviteRing label="Maaş paylaşımı" href="/share?tab=Maaş" />
        )}

        {reviewCount > 0 ? (
          <StatRing
            count={roundStatCount(reviewCount)}
            offset={offset}
            circumference={circumference}
            radius={radius}
            strokeWidth={strokeWidth}
            label="Çalışan yorumu"
          />
        ) : (
          <InviteRing label="Çalışan yorumu" href="/share?tab=Yorum" />
        )}
      </div>
    </section>
  );
}
