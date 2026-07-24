type SubRatings = {
  work_life_balance: number;
  management: number;
  career_growth: number;
  work_environment: number;
  transparency: number;
  employee_value: number;
};

const SUB_RATING_LABELS: Record<keyof SubRatings, string> = {
  work_life_balance: "İş-Yaşam Dengesi",
  management: "Yönetim",
  career_growth: "Kariyer Gelişimi",
  work_environment: "Çalışma Ortamı",
  transparency: "Şeffaflık",
  employee_value: "Çalışana Değer",
};

export default function CompanyOverviewBars({
  subRatingAverages,
  salaryRange,
  reviewCount,
}: {
  subRatingAverages: SubRatings;
  salaryRange: { min: number; max: number } | null;
  reviewCount: number;
}) {
  if (reviewCount === 0 && !salaryRange) return null;

  return (
    <div className="card-light rounded-2xl p-5 md:p-6 mt-4">
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
        {reviewCount > 0 &&
          (Object.keys(SUB_RATING_LABELS) as (keyof SubRatings)[]).map(
            (field) => {
              const value = subRatingAverages[field] || 0;

              return (
                <div key={field}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-[var(--text-dark)]">
                      {SUB_RATING_LABELS[field]}
                    </span>

                    <span className="text-[var(--muted-dark)]">
                      {value.toFixed(1)}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{
                        width: `${Math.min(100, (value / 5) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
      </div>

      {salaryRange && (
        <div className="mt-6 pt-5 border-t border-black/5 flex items-center justify-between">
          <span className="text-sm text-[var(--text-dark)]">
            Maaş Aralığı
          </span>

          <span className="text-sm font-semibold text-[var(--accent)]">
            ₺{salaryRange.min.toLocaleString("tr-TR")} - ₺
            {salaryRange.max.toLocaleString("tr-TR")}
          </span>
        </div>
      )}
    </div>
  );
}
