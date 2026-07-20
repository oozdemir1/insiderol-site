"use client";

import { useEffect, useState } from "react";

const stats = [
  { value: "4,200+", percent: 85, label: "Maaş paylaşımı" },
  { value: "800+", percent: 60, label: "Şirket" },
  { value: "1,500+", percent: 90, label: "Çalışan yorumu" },
];

export default function StatsSection() {
  const [animatedPercent, setAnimatedPercent] = useState(
    stats.map(() => 0)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPercent((prev) =>
        prev.map((p, i) => (p < stats[i].percent ? p + 2 : p))
      );
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[var(--section-light)] py-28 px-4">
      <div className="text-center mb-14 px-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
          çalışan deneyimi platformu
        </h2>

        <p className="text-[var(--muted-dark)] text-lg mt-5 leading-8 max-w-2xl mx-auto">
          Gerçek çalışan verileriyle maaşları, şirket kültürünü ve iş deneyimlerini keşfedin.
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-12 flex-wrap">
        {stats.map((stat, idx) => {
          const radius = 65;
          const strokeWidth = 10;
          const circumference = 2 * Math.PI * radius;
          const offset =
            circumference - (animatedPercent[idx] / 100) * circumference;

          return (
            <div
              key={idx}
              className="flex flex-col items-center min-w-[120px]"
            >
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
                  <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold text-[var(--text-dark)]">                  {stat.value}
                </div>
              </div>
              <p className="mt-4 text-center text-base md:text-xl text-[var(--muted-dark)]">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}