"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CompanyAutocomplete from "@/components/forms/CompanyAutocomplete";
import ContentEmptyState from "@/components/ui/ContentEmptyState";
import { turkishCities } from "@/app/constants/turkishCities";
import { INDUSTRIES } from "@/app/constants/industries";

type CompanyInfo = {
  id: number;
  name: string;
  slug: string;
  industry: number | null;
  hq_city: number | null;
};

type CompanyStats = {
  averageSalary: number;
  salaryCount: number;
  averageRating: number;
  reviewCount: number;
  workStyleLabel: string;
  workStyleCount: number;
};

const EMPTY_STATS: CompanyStats = {
  averageSalary: 0,
  salaryCount: 0,
  averageRating: 0,
  reviewCount: 0,
  workStyleLabel: "-",
  workStyleCount: 0,
};

const SLOTS = [0, 1, 2];

const REMOTE_POLICY_LABELS: Record<number, string> = {
  1: "Tam Uzaktan",
  2: "Uzaktan Ağırlıklı Hibrit",
  3: "Dengeli Hibrit",
  4: "Ofis Ağırlıklı Hibrit",
  5: "Tam İş Yerinde",
};

type Props = {
  roleId: number | null;
  experience: string | null;
  city: number | null;
  year: number | null;
};

export default function CompareView({ roleId, experience, city, year }: Props) {
  const [visibleSlots, setVisibleSlots] = useState(2);

  const [inputs, setInputs] = useState<string[]>(["", "", ""]);

  const [companies, setCompanies] = useState<(CompanyInfo | null)[]>([
    null,
    null,
    null,
  ]);

  const [stats, setStats] = useState<(CompanyStats | null)[]>([
    null,
    null,
    null,
  ]);

  const selectCompany = async (index: number, company: any) => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, slug, industry, hq_city")
      .eq("id", company.id)
      .single();

    setCompanies((prev) =>
      prev.map((c, i) => (i === index ? (data as CompanyInfo) : c))
    );
  };

  const clearSlot = (index: number) => {
    setInputs((prev) => prev.map((v, i) => (i === index ? "" : v)));
    setCompanies((prev) => prev.map((c, i) => (i === index ? null : c)));

    // The 3rd slot is opt-in — clearing it collapses the layout back to
    // the default 2-slot view instead of leaving an empty input dangling.
    if (index === 2) setVisibleSlots(2);
  };

  const activeCompanyIds = companies
    .filter((c): c is CompanyInfo => c !== null)
    .map((c) => c.id)
    .join(",");

  // Recompute scoped stats — salary/review averages narrowed to whatever
  // role/experience/city/year filters are active — whenever the selected
  // companies or filters change.
  useEffect(() => {
    if (!activeCompanyIds) {
      setStats([null, null, null]);
      return;
    }

    let cancelled = false;

    const companyIds = activeCompanyIds.split(",").map(Number);

    const run = async () => {
      let salariesQuery = supabase
        .from("salaries")
        .select("salary, company_id")
        .in("company_id", companyIds)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");

      if (roleId) salariesQuery = salariesQuery.eq("role_id", roleId);

      if (experience === "0-2") {
        salariesQuery = salariesQuery
          .gte("experience_years", 0)
          .lte("experience_years", 2);
      } else if (experience === "3-5") {
        salariesQuery = salariesQuery
          .gte("experience_years", 3)
          .lte("experience_years", 5);
      } else if (experience === "5+") {
        salariesQuery = salariesQuery.gte("experience_years", 5);
      }

      if (city) salariesQuery = salariesQuery.eq("work_city", city);

      if (year) {
        salariesQuery = salariesQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      let reviewsQuery = supabase
        .from("company_reviews")
        .select("overall_rating, company_id")
        .in("company_id", companyIds)
        .eq("moderation_status", "approved");

      if (roleId) reviewsQuery = reviewsQuery.eq("role_id", roleId);

      if (year) {
        reviewsQuery = reviewsQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      let workStylesQuery = supabase
        .from("company_work_style")
        .select("remote_policy, company_id")
        .in("company_id", companyIds)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");

      if (roleId) workStylesQuery = workStylesQuery.eq("role_id", roleId);

      if (city) workStylesQuery = workStylesQuery.eq("work_city", city);

      if (year) {
        workStylesQuery = workStylesQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      const [{ data: salaries }, { data: reviews }, { data: workStyles }] =
        await Promise.all([salariesQuery, reviewsQuery, workStylesQuery]);

      if (cancelled) return;

      const statsByCompany = new Map<
        number,
        {
          salaryTotal: number;
          salaryCount: number;
          ratingTotal: number;
          reviewCount: number;
          remotePolicyCounts: Record<number, number>;
        }
      >();

      const getStats = (id: number) => {
        let s = statsByCompany.get(id);

        if (!s) {
          s = {
            salaryTotal: 0,
            salaryCount: 0,
            ratingTotal: 0,
            reviewCount: 0,
            remotePolicyCounts: {},
          };

          statsByCompany.set(id, s);
        }

        return s;
      };

      (salaries || []).forEach((row: any) => {
        const s = getStats(row.company_id);
        s.salaryTotal += Number(row.salary) || 0;
        s.salaryCount += 1;
      });

      (reviews || []).forEach((row: any) => {
        const s = getStats(row.company_id);
        s.ratingTotal += Number(row.overall_rating) || 0;
        s.reviewCount += 1;
      });

      (workStyles || []).forEach((row: any) => {
        if (!row.remote_policy) return;
        const s = getStats(row.company_id);
        s.remotePolicyCounts[row.remote_policy] =
          (s.remotePolicyCounts[row.remote_policy] || 0) + 1;
      });

      setStats((prev) =>
        prev.map((_, i) => {
          const c = companies[i];
          if (!c) return null;

          const s = statsByCompany.get(c.id);
          if (!s) return EMPTY_STATS;

          const workStyleCount = Object.values(s.remotePolicyCounts).reduce(
            (sum, count) => sum + count,
            0
          );

          const topEntry = Object.entries(s.remotePolicyCounts).sort(
            (a, b) => b[1] - a[1]
          )[0];

          const workStyleLabel = topEntry
            ? REMOTE_POLICY_LABELS[Number(topEntry[0])] || "-"
            : "-";

          return {
            averageSalary:
              s.salaryCount > 0
                ? Math.round(s.salaryTotal / s.salaryCount)
                : 0,
            salaryCount: s.salaryCount,
            averageRating:
              s.reviewCount > 0 ? s.ratingTotal / s.reviewCount : 0,
            reviewCount: s.reviewCount,
            workStyleLabel,
            workStyleCount,
          };
        })
      );
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompanyIds, roleId, experience, city, year]);

  const activePairs = companies
    .map((c, i) => (c ? { company: c, stats: stats[i] } : null))
    .filter(
      (p): p is { company: CompanyInfo; stats: CompanyStats | null } =>
        p !== null
    );

  const getIndustryName = (id: number | null) =>
    INDUSTRIES.find((industry) => industry.id === id)?.name || "-";

  const getCityName = (id: number | null) =>
    turkishCities.find((c) => c.id === id)?.name || "-";

  return (
    <div>
      {year && (
        <p className="text-xs text-[var(--muted-dark)] mb-4">
          * Enflasyon etkisi hesaba katılmamıştır — rakamlar
          paylaşıldıkları tarihteki nominal değerlerdir.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3 mb-8">
        {SLOTS.slice(0, visibleSlots).map((index) => (
          <div key={index} className="relative">
            {companies[index] ? (
              <div className="form-field flex items-center justify-between">
                <span className="truncate">{companies[index]!.name}</span>

                <button
                  type="button"
                  onClick={() => clearSlot(index)}
                  className="text-black/40 hover:text-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <CompanyAutocomplete
                  value={inputs[index]}
                  onChange={(value) =>
                    setInputs((prev) =>
                      prev.map((v, i) => (i === index ? value : v))
                    )
                  }
                  onCompanySelect={(company) =>
                    company && selectCompany(index, company)
                  }
                  searchOnly
                  placeholder={`${index + 1}. şirket ara...`}
                  inputClassName={index === 2 ? "pr-8" : ""}
                />

                {index === 2 && (
                  <button
                    type="button"
                    onClick={() => clearSlot(2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {visibleSlots < 3 && (
          <button
            type="button"
            onClick={() => setVisibleSlots(3)}
            style={{ borderStyle: "dashed" }}
            className="
              form-field
              flex items-center justify-center gap-2
              text-[var(--muted-dark)]
              hover:text-[var(--text-dark)]
            "
          >
            <Plus size={16} />
            3. şirket ekle
          </button>
        )}
      </div>

      {activePairs.length < 2 ? (
        <ContentEmptyState
          title="En Az İki Şirket Seç"
          message="Karşılaştırmaya başlamak için yukarıdaki kutulardan en az 2 şirket ara ve seç, karşılaştırma tablosu burada görünecek."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm text-[var(--muted-dark)] pb-3 pr-4" />

                {activePairs.map(({ company }) => (
                  <th key={company.id} className="text-left pb-3 px-4">
                    <Link
                      href={`/companies/${company.slug}`}
                      className="font-semibold text-[var(--text-dark)] hover:underline"
                    >
                      {company.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Sektör
                </td>

                {activePairs.map(({ company }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {getIndustryName(company.industry)}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Genel Merkez
                </td>

                {activePairs.map(({ company }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {getCityName(company.hq_city)}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Ortalama Puan
                </td>

                {activePairs.map(({ company, stats: s }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {s ? `★ ${s.averageRating.toFixed(1)}` : "…"}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Yorum Sayısı
                </td>

                {activePairs.map(({ company, stats: s }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {s ? s.reviewCount : "…"}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Ortalama Maaş
                </td>

                {activePairs.map(({ company, stats: s }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {s
                      ? s.averageSalary > 0
                        ? `₺${s.averageSalary.toLocaleString("tr-TR")}`
                        : "-"
                      : "…"}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Maaş Verisi
                </td>

                {activePairs.map(({ company, stats: s }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {s ? s.salaryCount : "…"}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-black/5">
                <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                  Çalışma Şekli
                </td>

                {activePairs.map(({ company, stats: s }) => (
                  <td key={company.id} className="py-3 px-4 text-[var(--text-dark)]">
                    {s
                      ? s.workStyleCount > 0
                        ? `${s.workStyleLabel} (${s.workStyleCount})`
                        : "-"
                      : "…"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
