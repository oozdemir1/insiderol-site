"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

type SalaryData = {
  role: string;
  avgSalary: number; // bin TL
  color: string;
  hoverColor: string;
  trendPercent: number; // değişim yüzdesi
};

export default function SalaryTrends() {
  // Salary data
  const salaryData: SalaryData[] = [
    { role: "Data Analyst", avgSalary: 82, color: "var(--card-green-3)", hoverColor: "var(--card-green-3-hover)", trendPercent: 9 },
    { role: "Frontend Developer", avgSalary: 95, color: "var(--card-green)", hoverColor: "var(--card-green-hover)", trendPercent: 12 },
    { role: "Product Manager", avgSalary: 140, color: "var(--card-green-2)", hoverColor: "var(--card-green-2-hover)", trendPercent: 18 },
  ];

  // Yeni sıralama: soldan sağa → Data Analyst, Frontend, Product Manager
  const orderedSalaryData: SalaryData[] = [
    salaryData[0], // Data Analyst
    salaryData[1], // Frontend Developer
    salaryData[2], // Product Manager
  ];

  // Bar yükseklikleri aynı sıraya göre: kısa → orta → uzun
  const orderedHeights = [160, 200, 260];

  // Animated heights state
  const [animatedHeights, setAnimatedHeights] = useState<number[]>(orderedSalaryData.map(() => 0));

  // Intersection observer
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  // Animate bars on scroll
  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => {
        setAnimatedHeights(orderedHeights);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [inView, orderedHeights]);

  return (
    <section className="py-4 px-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-dark)]">
            Maaş
          </h2>
          <p className="text-[var(--muted-dark)] text-sm mt-2">
            Popüler pozisyonlar için güncel maaş ortalamaları
          </p>
        </div>

        {/* Vertical Bar Graph */}
        <div ref={ref} className="relative flex items-end justify-between gap-6 h-[260px] mt-24">

          {/* Axis line */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--muted-dark)]"></div>

          {orderedSalaryData.map((bar, idx) => (
            <div key={bar.role} className="flex flex-col items-center w-24 relative group">

              {/* Animated Bar */}
              <motion.div
                className="w-full rounded-t-xl relative cursor-pointer trend-bar-salary"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: animatedHeights[idx], opacity: animatedHeights[idx] ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Tooltip */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-44 p-3 rounded-lg bg-[var(--section-light-2)] text-[var(--text-dark)] text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <div className="font-semibold">{bar.role}</div>
                  <div>{bar.avgSalary * 1000} TL</div>
                  <div className={`text-sm ${bar.trendPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {bar.trendPercent >= 0 ? '↗' : '↘'} {Math.abs(bar.trendPercent)}%
                  </div>
                </div>
              </motion.div>

              {/* Role label */}
              <span className="mt-2 font-semibold text-[var(--text-dark)] truncate w-full text-center" title={bar.role}>
                {bar.role}
              </span>
              <span className="text-[var(--muted-dark)] text-sm mt-1">{bar.avgSalary * 1000} TL</span>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}