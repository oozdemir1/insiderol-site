"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

// Child components (mevcut kodlarından)
import TrendingCompanies from "./TrendingCompanies";
import SalaryTrends from "./SalaryTrends";

export default function TrendsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => setLineHeight(320), 200); // animasyonlu line height
      return () => clearTimeout(timeout);
    }
  }, [inView]);

  return (
    
    <section className="py-28 px-8 bg-[var(--section-light)] text-[var(--text-dark)]">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Trendler
        </h2>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-10" ref={ref}>

        
        
        {/* Left: Trending Companies */}
        <div className="flex-1">
          <TrendingCompanies />
        </div>

        {/* Middle: Animated Vertical Line (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center">
            <motion.div
            className="w-[2px] bg-[#FF7F00] rounded-full" // koyu turuncu
            initial={{ height: 0 }}
            animate={{ height: lineHeight }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>

        {/* Right: Salary Trends */}
        <div className="flex-1">
          <SalaryTrends />
        </div>

      </div>
    </section>
  );
}