"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";

type CompanyHeaderCardProps = {
  companyName: string;
  logoContent: React.ReactNode;
  companyCityName: string;
  averageReviewRating: string;
  reviewCount: number;
  averageSalary: number;
  salaryCount: number;
  industryName: string;
};

// The company name stays visible even when collapsed — a visitor who lands
// directly on a specific tab (search result, shared link) shouldn't lose
// track of which company's page they're on just because they toggled the
// logo/stats block out of the way while filtering or submitting.
export default function CompanyHeaderCard({
  companyName,
  logoContent,
  companyCityName,
  averageReviewRating,
  reviewCount,
  averageSalary,
  salaryCount,
  industryName,
}: CompanyHeaderCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Starts expanded on the server (matches desktop) then collapses on mount
  // if we're on mobile, to avoid a hydration mismatch from checking
  // window width during initial render.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setExpanded(false);
    }
  }, []);

  return (
    <div className="card-light rounded-2xl p-3 md:p-5">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-center gap-1 md:gap-2 text-center"
      >
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0" />
        )}

        <span className="text-2xl text-[var(--text-dark)]">
          <span className="font-medium text-[var(--text-dark)]">
            {companyName}
          </span>
          <span className="ml-1.5 text-[var(--muted-dark)]">Çalışan Deneyimleri</span>
        </span>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col md:flex-row md:items-center md:gap-8 md:h-[104px] mt-4">
          {/* Logo */}
          <div className="flex-shrink-0 self-center text-center md:text-left relative mb-6 md:mb-0">
            {logoContent}
            <p className="flex items-center justify-center gap-1 text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-0.5 max-w-24 mx-auto text-center">
              <MapPin size={10} className="text-red-500 shrink-0" />
              {companyCityName}
            </p>
          </div>

          <div className="hidden md:block w-px h-15 self-center bg-black/10" />

          {/* Stats Cards */}
          <div className="flex-1 flex flex-col md:items-start items-center gap-4">
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full">
              <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
                <p className="text-[var(--text-dark)] text-[20px] font-semibold tracking-tight leading-none">
                  ⭐{averageReviewRating}
                </p>
                <p className="w-full truncate text-center text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                  {reviewCount} Yorum
                </p>
              </div>

              <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
                <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                  {averageSalary > 0
                    ? `${averageSalary.toLocaleString("tr-TR")}₺`
                    : "-"}
                </div>
                <p className="w-full truncate text-center text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                  {salaryCount} Paylaşım
                </p>
              </div>

              <div className="card-light card-compact flex flex-col items-center justify-center gap-3 text-center">
                <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                  {industryName}
                </div>
                <p className="w-full truncate text-center text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
                  Sektör
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
