"use client";

import { useRef, useState } from "react";
import SalaryCard from "@/components/SalaryCard";

// Demo salary verisi
const demoSalaries = [
  { role: "Frontend Developer", salary: 15000, experienceLabel: "3-5 yıl", cityLabel: "İstanbul" },
  { role: "Backend Developer", salary: 14500, experienceLabel: "1-3 yıl", cityLabel: "İstanbul" },
  { role: "Fullstack Developer", salary: 16000, experienceLabel: "3-5 yıl", cityLabel: "İstanbul" },
  { role: "Data Analyst", salary: 13500, experienceLabel: "1-3 yıl", cityLabel: "İstanbul" },
  { role: "UI Designer", salary: 12000, experienceLabel: "0-1 yıl", cityLabel: "İstanbul" },
  { role: "Project Manager", salary: 17000, experienceLabel: "5-7 yıl", cityLabel: "İstanbul" },
];

export default function SalaryPreviewCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // useRef ile değerleri sakla
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  // Smooth scroll JS (ok tuşları)
  const smoothScrollBy = (distance: number) => {
    const container = containerRef.current;
    if (!container) return;

    const start = container.scrollLeft;
    const end = start + distance;
    const duration = 400; // ms
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollLeft = start + (end - start) * easeInOutQuad(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    const easeInOutQuad = (t: number) => (t < 0.5 ? 2*t*t : -1 + (4-2*t)*t);

    requestAnimationFrame(animate);
  };

  const scrollLeft = () => smoothScrollBy(-containerRef.current!.offsetWidth);
  const scrollRight = () => smoothScrollBy(containerRef.current!.offsetWidth);

  return (
    <section className="py-28 bg-[var(--section-light-2)]">
      <div className="relative max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 px-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-dark)]">Son Maaş Paylaşımları</h2>
            <p className="text-[var(--muted-dark)] text-lg mt-3">Demo çalışan maaş kartları</p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Sol ok */}
          <button
            onClick={scrollLeft}
             className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-xl p-3 rounded-full flex items-center justify-center text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Sağ ok */}
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-xl p-3 rounded-full flex items-center justify-center text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards container */}
          <div
            ref={containerRef}
            className={`flex overflow-x-auto scroll-smooth scrollbar-hide gap-6 snap-x snap-mandatory px-8 select-none ${isDragging ? "cursor-grabbing" : "cursor-default"}`}
            onMouseDown={(e) => {
              setIsDragging(true);
              startXRef.current = e.pageX;
              scrollLeftStartRef.current = containerRef.current!.scrollLeft;
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              const walk = startXRef.current - e.pageX;
              containerRef.current!.scrollLeft = scrollLeftStartRef.current + walk;
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {demoSalaries.map((salary, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[calc(25%-1.5rem)] md:w-[calc(20%-1.5rem)] snap-start"
              >
                <SalaryCard
                  role={salary.role}
                  salary={salary.salary}
                  experienceLabel={salary.experienceLabel}
                  cityLabel={salary.cityLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}