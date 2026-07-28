"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { turkishCities } from "@/app/constants/turkishCities";
import { REMOTE_POLICY_LABELS } from "@/app/constants/companyPolicyLabels";
import { getExperienceYearsLabel } from "@/app/constants/lookupHelpers";
import SelectDropdown from "@/components/forms/SelectDropdown";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import FiltersToggle from "@/components/FiltersToggle";

type SalaryRow = {
  id: number;
  salary: number;
  experience_years: number | null;
  work_city: number | null;
  company_id: number;
  created_at: string;
  companies: {
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
};

type ReviewRow = {
  id: number;
  overall_rating: number;
  company_id: number;
  created_at: string;
};

type WorkStyleRow = {
  id: number;
  remote_policy: number | null;
  work_city: number | null;
  company_id: number;
  created_at: string;
};

type Props = {
  roleName: string;
  salaries: SalaryRow[];
  reviews: ReviewRow[];
  workStyles: WorkStyleRow[];
};

// Collapsed from two separate dropdowns (a "group by" + a "sort by") into
// one flat list — grouping and ordering were two independent axes on the
// same control surface, which read as more complex than it needed to be
// (picking a group, then having a second control silently reorder within
// it, confused rather than clarified). Çalışılan Şehir / Çalışma Biçimi
// switch what's being listed; the other three keep the company listing but
// change its order — same "one control, flat options" shape either way.
type ViewMode = "salary" | "recent" | "az" | "city" | "workstyle";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "az", label: "Alfabetik (A-Z)" },
  { value: "city", label: "Çalışılan Şehir" },
  { value: "workstyle", label: "Çalışma Biçimi" },
  { value: "salary", label: "Maaş En Yüksek -> Düşük" },
  { value: "recent", label: "Son Eklenenler" },
];

export default function RolePageClient({
  roleName,
  salaries,
  reviews,
  workStyles,
}: Props) {
  const [selectedExperience, setSelectedExperience] = useState<number | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("az");

  const [bannerExpanded, setBannerExpanded] = useState(true);

  // Starts expanded on the server (matches desktop) then collapses on mount
  // if we're on mobile, to avoid a hydration mismatch from checking
  // window width during initial render — same approach as the company
  // page's CompanyHeaderCard.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setBannerExpanded(false);
    }
  }, []);

  // Only one breakdown list is visible at a time, so one page counter
  // covers all three (company/city/workstyle) — reset whenever a filter
  // or the view itself changes, same discipline as the company page's
  // per-tab Load More.
  const [breakdownPage, setBreakdownPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // experience_years stores a bucket id (1="0-1 yıl" ... 6="10+ yıl", see
  // experienceLevels.ts), not a literal year count — options come from
  // whatever buckets are actually present, same as the company page's
  // buildExperienceOptions, so a filter never selects into a dead end.
  const experienceOptions = useMemo(() => {
    const ids = new Set<number>();

    salaries.forEach((s) => {
      if (s.experience_years) ids.add(s.experience_years);
    });

    return Array.from(ids)
      .map((id) => ({ value: id, label: getExperienceYearsLabel(id) }))
      .sort((a, b) => a.value - b.value);
  }, [salaries]);

  const breakdownView: "company" | "city" | "workstyle" =
    viewMode === "city" || viewMode === "workstyle" ? viewMode : "company";

  const sortOrder: "salary" | "recent" | "az" =
    viewMode === "recent" || viewMode === "az" ? viewMode : "salary";

  // Only cities/years actually present in this role's data — same reasoning
  // as the company page's filter-option builders: a filter should never be
  // able to select its way into a dead-end "0 results" state.
  const cityOptions = useMemo(() => {
    const ids = new Set<number>();

    salaries.forEach((s) => {
      if (s.work_city) ids.add(s.work_city);
    });

    return Array.from(ids)
      .map((id) => ({
        value: id,
        label: turkishCities.find((c) => c.id === id)?.name || "-",
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [salaries]);

  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => currentYear - i).map((y) => ({
        value: y,
        label: String(y),
      })),
    [currentYear]
  );

  const filteredSalaries = useMemo(
    () =>
      salaries.filter((s) => {
        if (selectedExperience && s.experience_years !== selectedExperience)
          return false;

        if (selectedCity && s.work_city !== selectedCity) return false;

        if (
          selectedYear &&
          new Date(s.created_at).getFullYear() !== selectedYear
        )
          return false;

        return true;
      }),
    [salaries, selectedExperience, selectedCity, selectedYear]
  );

  const filteredReviews = useMemo(
    () =>
      reviews.filter((r) => {
        if (
          selectedYear &&
          new Date(r.created_at).getFullYear() !== selectedYear
        )
          return false;

        return true;
      }),
    [reviews, selectedYear]
  );

  // No experience_years column on this table (same as the company page's
  // çalışma biçimi tab, which has no Deneyim filter either) — only city
  // and year narrow it.
  const filteredWorkStyles = useMemo(
    () =>
      workStyles.filter((w) => {
        if (selectedCity && w.work_city !== selectedCity) return false;

        if (
          selectedYear &&
          new Date(w.created_at).getFullYear() !== selectedYear
        )
          return false;

        return true;
      }),
    [workStyles, selectedCity, selectedYear]
  );

  const totalSalaries = filteredSalaries.length;

  const averageSalary =
    totalSalaries > 0
      ? Math.round(
          filteredSalaries.reduce(
            (acc, curr) => acc + (Number(curr.salary) || 0),
            0
          ) / totalSalaries
        )
      : 0;

  const totalReviews = filteredReviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          filteredReviews.reduce(
            (acc, curr) => acc + (Number(curr.overall_rating) || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0";

  // Per-company breakdown — the whole reason this page pivots on role
  // instead of company: seeing the same position's pay/rating side by
  // side across employers.
  const companyBreakdown = useMemo(() => {
    const companyStatsById = new Map<
      number,
      {
        name: string;
        slug: string;
        logoUrl: string | null;
        salaryTotal: number;
        salaryCount: number;
        ratingTotal: number;
        reviewCount: number;
        remotePolicyCounts: Record<number, number>;
        lastSubmittedAt: number;
      }
    >();

    const getCompanyStats = (
      companyId: number,
      company: SalaryRow["companies"]
    ) => {
      let stats = companyStatsById.get(companyId);

      if (!stats) {
        stats = {
          name: company?.name || "Bilinmeyen Şirket",
          slug: company?.slug || "",
          logoUrl: company?.logo_url || null,
          salaryTotal: 0,
          salaryCount: 0,
          ratingTotal: 0,
          reviewCount: 0,
          remotePolicyCounts: {},
          lastSubmittedAt: 0,
        };

        companyStatsById.set(companyId, stats);
      } else if (company) {
        // A company can first get created via a review/work-style row
        // (name-less fallback) before its salary row is processed — patch
        // in the real name/slug once we do see it.
        stats.name = company.name;
        stats.slug = company.slug;
        stats.logoUrl = company.logo_url;
      }

      return stats;
    };

    const bumpLastSubmitted = (
      stats: { lastSubmittedAt: number },
      createdAt: string
    ) => {
      const t = new Date(createdAt).getTime();
      if (t > stats.lastSubmittedAt) stats.lastSubmittedAt = t;
    };

    filteredSalaries.forEach((salary) => {
      if (!salary.company_id) return;

      const stats = getCompanyStats(salary.company_id, salary.companies);

      stats.salaryTotal += Number(salary.salary) || 0;
      stats.salaryCount += 1;
      bumpLastSubmitted(stats, salary.created_at);
    });

    filteredReviews.forEach((review) => {
      if (!review.company_id) return;

      // A review's company row isn't fetched — only salaries carries the
      // join — so fall back to whatever's already in the map (a company
      // with reviews but zero salaries would still need a name, but we
      // only have its id in that case).
      const stats = getCompanyStats(review.company_id, null);

      stats.ratingTotal += Number(review.overall_rating) || 0;
      stats.reviewCount += 1;
      bumpLastSubmitted(stats, review.created_at);
    });

    filteredWorkStyles.forEach((workStyle) => {
      if (!workStyle.company_id) return;

      const stats = getCompanyStats(workStyle.company_id, null);

      bumpLastSubmitted(stats, workStyle.created_at);

      if (!workStyle.remote_policy) return;

      stats.remotePolicyCounts[workStyle.remote_policy] =
        (stats.remotePolicyCounts[workStyle.remote_policy] || 0) + 1;
    });

    const rows = Array.from(companyStatsById.entries()).map(
      ([companyId, stats]) => {
        const workStyleCount = Object.values(
          stats.remotePolicyCounts
        ).reduce((sum, count) => sum + count, 0);

        const topEntry = Object.entries(stats.remotePolicyCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];

        const workStyleLabel = topEntry
          ? REMOTE_POLICY_LABELS[Number(topEntry[0])] || "-"
          : "-";

        return {
          companyId,
          name: stats.name,
          slug: stats.slug,
          logoUrl: stats.logoUrl,
          salaryCount: stats.salaryCount,
          reviewCount: stats.reviewCount,
          workStyleCount,
          workStyleLabel,
          lastSubmittedAt: stats.lastSubmittedAt,
          averageSalary:
            stats.salaryCount > 0
              ? Math.round(stats.salaryTotal / stats.salaryCount)
              : 0,
          averageRating:
            stats.reviewCount > 0 ? stats.ratingTotal / stats.reviewCount : 0,
        };
      }
    );

    if (sortOrder === "recent") {
      rows.sort((a, b) => b.lastSubmittedAt - a.lastSubmittedAt);
    } else if (sortOrder === "az") {
      rows.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    } else {
      rows.sort((a, b) => b.averageSalary - a.averageSalary);
    }

    return rows;
  }, [filteredSalaries, filteredReviews, filteredWorkStyles, sortOrder]);

  // City breakdown — same salary rows, grouped by work_city instead of
  // company. Reviews carry no work_city, so rating stays company-only;
  // work style does carry work_city, so it's foldable in here too. Always
  // sorted by average salary — "Çalışılan Şehir" is its own option in the
  // Sırala dropdown, so there's no separate order to apply on top of it.
  const cityBreakdown = useMemo(() => {
    const cityStatsById = new Map<
      number,
      {
        salaryTotal: number;
        salaryCount: number;
        remotePolicyCounts: Record<number, number>;
      }
    >();

    const getCityStats = (cityId: number) => {
      let stats = cityStatsById.get(cityId);

      if (!stats) {
        stats = { salaryTotal: 0, salaryCount: 0, remotePolicyCounts: {} };
        cityStatsById.set(cityId, stats);
      }

      return stats;
    };

    filteredSalaries.forEach((salary) => {
      if (!salary.work_city) return;

      const stats = getCityStats(salary.work_city);

      stats.salaryTotal += Number(salary.salary) || 0;
      stats.salaryCount += 1;
    });

    filteredWorkStyles.forEach((workStyle) => {
      if (!workStyle.work_city || !workStyle.remote_policy) return;

      const stats = getCityStats(workStyle.work_city);

      stats.remotePolicyCounts[workStyle.remote_policy] =
        (stats.remotePolicyCounts[workStyle.remote_policy] || 0) + 1;
    });

    return Array.from(cityStatsById.entries())
      .map(([cityId, stats]) => {
        const workStyleCount = Object.values(
          stats.remotePolicyCounts
        ).reduce((sum, count) => sum + count, 0);

        const topEntry = Object.entries(stats.remotePolicyCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];

        const workStyleLabel = topEntry
          ? REMOTE_POLICY_LABELS[Number(topEntry[0])] || "-"
          : "-";

        return {
          cityId,
          name:
            turkishCities.find((c) => c.id === cityId)?.name ||
            "Bilinmeyen Şehir",
          salaryCount: stats.salaryCount,
          workStyleCount,
          workStyleLabel,
          averageSalary:
            stats.salaryCount > 0
              ? Math.round(stats.salaryTotal / stats.salaryCount)
              : 0,
        };
      })
      .sort((a, b) => b.averageSalary - a.averageSalary);
  }, [filteredSalaries, filteredWorkStyles]);

  // Çalışma Biçimi — unlike company/city, there's no "average
  // salary" that belongs to a work-style category as a whole, so this
  // always sorts most-common-first (same convention as the company page's
  // StatBreakdown bars) rather than taking an order from the Sırala
  // dropdown, which only has one entry point into this view anyway.
  const workStyleBreakdown = useMemo(() => {
    const counts: Record<number, number> = {};

    filteredWorkStyles.forEach((w) => {
      if (!w.remote_policy) return;
      counts[w.remote_policy] = (counts[w.remote_policy] || 0) + 1;
    });

    const total = filteredWorkStyles.length || 1;

    return Object.entries(counts)
      .map(([policy, count]) => ({
        policyId: Number(policy),
        label: REMOTE_POLICY_LABELS[Number(policy)] || "-",
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
  }, [filteredWorkStyles]);

  return (
    <>
      <div className="card-light rounded-2xl p-3 md:p-5 mt-6">
        <button
          type="button"
          onClick={() => setBannerExpanded((prev) => !prev)}
          className="w-full flex items-center justify-center gap-1.5 md:gap-2 text-center mb-4 xl:pointer-events-none xl:cursor-default"
        >
          {bannerExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0 xl:hidden" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0 xl:hidden" />
          )}

          <span className="text-xl md:text-2xl text-[var(--text-dark)]">
            <span className="font-medium text-[var(--text-dark)]">
              {roleName}
            </span>

            <span className="ml-1.5 text-[var(--muted-dark)]">
              Şirket Karşılaştırması
            </span>
          </span>

          {bannerExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0 xl:hidden" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-[var(--muted-dark)] shrink-0 xl:hidden" />
          )}
        </button>

        <div className={`${bannerExpanded ? "flex" : "hidden"} xl:flex flex-col md:flex-row md:items-center md:gap-8 md:h-[104px]`}>
          {/* Logo — roles have no uploaded image (unlike companies), so a
              generic icon fills the same slot instead of a real logo. */}
          <div className="flex-shrink-0 self-center mb-6 md:mb-0">
            <div
              className="
                relative z-10
                w-24 h-24 rounded-3xl
                bg-white
                border border-black/5
                shadow-[0_1px_2px_rgba(0,0,0,0.03)]
                flex items-center justify-center
                overflow-hidden
              "
            >
              <Briefcase size={40} className="text-[var(--accent)]" />
            </div>
          </div>

          <div className="hidden md:block w-px h-15 self-center bg-black/10" />

          <div className="flex-1 flex flex-col md:items-start items-center gap-4">
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full">
              <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
                <div className="text-[16px] md:text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                  {companyBreakdown.length}
                </div>
                <p className="w-full truncate text-center text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                  Şirket
                </p>
              </div>

              <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
                <p className="text-[var(--text-dark)] text-[16px] md:text-[20px] font-semibold tracking-tight leading-none">
                  ⭐{averageRating}
                </p>
                <p className="w-full truncate text-center text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                  {totalReviews} Yorum
                </p>
              </div>

              <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
                <div className="text-[16px] md:text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                  {averageSalary > 0
                    ? `${averageSalary.toLocaleString("tr-TR")}₺`
                    : "-"}
                </div>
                <p className="w-full truncate text-center text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                  {totalSalaries} Paylaşım
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
      <FiltersToggle breakpoint="md">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <SelectDropdown
          value={selectedExperience}
          onChange={(value) => {
            setSelectedExperience(value);
            setBreakdownPage(1);
          }}
          options={experienceOptions}
          placeholder="Tüm Deneyimler"
        />

        <SelectDropdown
          value={selectedCity}
          onChange={(value) => {
            setSelectedCity(value);
            setBreakdownPage(1);
          }}
          options={cityOptions}
          placeholder="Tüm Şehirler"
        />

        <SelectDropdown
          value={selectedYear}
          onChange={(value) => {
            setSelectedYear(value);
            setBreakdownPage(1);
          }}
          options={yearOptions}
          placeholder="Tüm Yıllar"
        />

        <SelectDropdown
          value={viewMode}
          onChange={(value) => {
            setViewMode(value || "az");
            setBreakdownPage(1);
          }}
          options={VIEW_OPTIONS}
          placeholder="Sırala"
          defaultValue="az"
        />
      </div>
      </FiltersToggle>
      </div>

      {selectedYear && (
        <p className="text-xs text-[var(--muted-dark)] mt-2">
          * Enflasyon etkisi hesaba katılmamıştır — rakamlar
          paylaşıldıkları tarihteki nominal değerlerdir.
        </p>
      )}

      <div className="mt-3">
        {breakdownView === "workstyle" ? (
          workStyleBreakdown.length === 0 ? (
            <div className="card-light rounded-[1rem] p-6 text-center text-[var(--muted-dark)]">
              Bu filtrelerle eşleşen çalışma biçimi verisi yok.
            </div>
          ) : (
            <div className="grid gap-3">
              {workStyleBreakdown.slice(0, breakdownPage * ITEMS_PER_PAGE).map((policyStat) => (
                <div
                  key={policyStat.policyId}
                  className="card-light rounded-[1rem] p-4 md:p-5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-md font-semibold text-[var(--text-dark)] truncate">
                      {policyStat.label}
                    </h3>

                    <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                      {policyStat.count} paylaşım
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-[var(--text-dark)]">
                      {policyStat.percent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : breakdownView === "city" ? (
          cityBreakdown.length === 0 ? (
            <div className="card-light rounded-[1rem] p-6 text-center text-[var(--muted-dark)]">
              Bu filtrelerle eşleşen şehir bazlı veri yok.
            </div>
          ) : (
            <div className="grid gap-3">
              {cityBreakdown.slice(0, breakdownPage * ITEMS_PER_PAGE).map((cityStat) => (
                <div
                  key={cityStat.cityId}
                  className="card-light rounded-[1rem] p-4 md:p-5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-md font-semibold text-[var(--text-dark)] truncate">
                      {cityStat.name}
                    </h3>

                    <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                      {cityStat.salaryCount} maaş
                      {cityStat.workStyleCount > 0 &&
                        ` · ${cityStat.workStyleLabel}`}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={
                        cityStat.averageSalary > 0
                          ? "text-lg font-semibold text-[var(--text-dark)]"
                          : "text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80"
                      }
                    >
                      {cityStat.averageSalary > 0
                        ? `${cityStat.averageSalary.toLocaleString("tr-TR")}₺`
                        : "Henüz Maaş Bilgisi Yok"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : companyBreakdown.length === 0 ? (
          <div className="card-light rounded-[1rem] p-6 text-center text-[var(--muted-dark)]">
            Bu filtrelerle eşleşen şirket bazlı veri yok.
          </div>
        ) : (
          <div className="grid gap-3">
            {companyBreakdown.slice(0, breakdownPage * ITEMS_PER_PAGE).map((company) => (
              <Link
                key={company.companyId}
                href={company.slug ? `/companies/${company.slug}` : "#"}
                className="card-light rounded-[1rem] p-4 md:p-5 flex items-center gap-4"
              >
                <div
                  className="
                    w-12 h-12
                    rounded-md
                    border
                    flex items-center justify-center
                    font-semibold
                    flex-shrink-0
                    bg-white
                    overflow-hidden
                  "
                >
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    company.name.charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-semibold text-[var(--text-dark)] truncate">
                    {company.name}
                  </h3>

                  <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                    {company.salaryCount} maaş · {company.reviewCount} yorum
                    {company.workStyleCount > 0 &&
                      ` · ${company.workStyleLabel}`}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div
                    className={
                      company.averageSalary > 0
                        ? "text-lg font-semibold text-[var(--text-dark)]"
                        : "text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80"
                    }
                  >
                    {company.averageSalary > 0
                      ? `${company.averageSalary.toLocaleString("tr-TR")}₺`
                      : "Henüz Maaş Bilgisi Yok"}
                  </div>

                  <div className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                    {company.averageRating > 0
                      ? `⭐ ${company.averageRating.toFixed(1)}`
                      : "Henüz Puan Bilgisi Yok"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(breakdownView === "workstyle"
          ? workStyleBreakdown.length
          : breakdownView === "city"
            ? cityBreakdown.length
            : companyBreakdown.length) >
          breakdownPage * ITEMS_PER_PAGE && (
          <LoadMoreButton
            onClick={() => setBreakdownPage(breakdownPage + 1)}
          />
        )}
      </div>
    </>
  );
}
