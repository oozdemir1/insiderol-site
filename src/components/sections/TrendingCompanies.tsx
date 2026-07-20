"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

type BarData = {
  company: string;
  salary: number; // bin TL
  color: string;
  hoverColor: string;
  rank: number;
  reviews: number;
  trendPercent: number;
};

export default function TrendingCompanies() {
  const barData: BarData[] = [
    { company: "Trendyol", salary: 95, color: "var(--card-green)", hoverColor: "var(--card-green-hover)", rank: 1, reviews: 120, trendPercent: 12 },
    { company: "Getir", salary: 82, color: "var(--card-green-2)", hoverColor: "var(--card-green-2-hover)", rank: 2, reviews: 84, trendPercent: 8 },
    { company: "Insider", salary: 75, color: "var(--card-green-3)", hoverColor: "var(--card-green-3-hover)", rank: 3, reviews: 67, trendPercent: -5 },
  ];

  const hardCodedHeights = [260, 200, 160]; // soldan sağa: max → min
  const [animated, setAnimated] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timeout);
    }
  }, [inView]);

  return (
    <section className="py-4 px-8 bg-[var(--section-light)] text-[var(--text-dark)]">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-dark)]">Şirket</h2>
          <p className="text-[var(--muted-dark)] text-sm mt-2">Bu hafta en çok incelenen şirketler</p>
        </div>

        {/* Bar Graph */}
        <div ref={ref} className="relative flex items-end justify-between gap-6 h-[260px] mt-24">

          {/* Axis line */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--muted-dark)]"></div>

          {barData.map((bar, idx) => (
            <div key={bar.company} className="flex flex-col items-center w-24 relative group ">

              {/* Animated Bar */}
              <motion.div
                className="w-full rounded-t-xl relative cursor-pointer trend-bar-company"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: animated ? hardCodedHeights[idx] : 0, opacity: animated ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Gradient hover overlay */}
                <div className="absolute inset-0 rounded-t-xl opacity-0 group-hover:opacity-30 bg-gradient-to-t from-[var(--card-green-hover)] to-[var(--card-green)] transition-opacity duration-300"></div>

                {/* Tooltip */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 p-3 rounded-lg bg-[var(--section-light-2)] text-[var(--text-dark)] text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <div className="font-semibold">{bar.company}</div>
                  <div>{bar.salary * 1000} TL</div>
                  <div className={`text-sm ${bar.trendPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {bar.trendPercent >= 0 ? '↗' : '↘'} {Math.abs(bar.trendPercent)}%
                  </div>
                </div>
              </motion.div>

              {/* Labels */}
              <span className="mt-2 font-semibold text-[var(--text-dark)] truncate w-full text-center" title={bar.company}>
                {bar.company}
              </span>
              <span className="text-[var(--muted-dark)] text-sm mt-1">{bar.salary * 1000} TL</span>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}