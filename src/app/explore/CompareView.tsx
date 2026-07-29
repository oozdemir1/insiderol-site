"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CompanyAutocomplete from "@/components/forms/CompanyAutocomplete";
import RoleAutocomplete from "@/components/forms/RoleAutocomplete";
import ContentEmptyState from "@/components/ui/ContentEmptyState";
import { turkishCities } from "@/app/constants/turkishCities";
import { INDUSTRIES } from "@/app/constants/industries";
import { slugifyText } from "@/app/constants/normalizationUtils";

type CompanyInfo = {
  id: number;
  name: string;
  slug: string;
  industry: number | null;
  hq_city: number | null;
};

// Shared shape — a company's and a role's comparison stats are computed
// the same way (just grouped by a different id column), so one type and
// one EMPTY_STATS constant covers both modes.
type CompareStats = {
  averageSalary: number;
  salaryCount: number;
  averageRating: number;
  reviewCount: number;
  workStyleLabel: string;
  workStyleCount: number;
};

const EMPTY_STATS: CompareStats = {
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

type CompareMode = "company" | "role";

type Props = {
  mode: CompareMode;
  roleId: number | null;
  roleName: string | null;
  companyId: number | null;
  companyName: string | null;
  experience: number | null;
  city: number | null;
  year: number | null;
};

// Aggregates raw salary/review/work-style rows into per-id CompareStats —
// shared by both the company-mode and role-mode effects below, since the
// aggregation logic is identical once the rows are already grouped by
// whichever id (company_id or role_id) is being compared.
function aggregateStats(
  ids: number[],
  salaries: { [key: string]: any }[],
  reviews: { [key: string]: any }[],
  workStyles: { [key: string]: any }[],
  idField: "company_id" | "role_id"
): Map<number, CompareStats> {
  const statsById = new Map<
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
    let s = statsById.get(id);

    if (!s) {
      s = {
        salaryTotal: 0,
        salaryCount: 0,
        ratingTotal: 0,
        reviewCount: 0,
        remotePolicyCounts: {},
      };

      statsById.set(id, s);
    }

    return s;
  };

  salaries.forEach((row) => {
    const s = getStats(row[idField]);
    s.salaryTotal += Number(row.salary) || 0;
    s.salaryCount += 1;
  });

  reviews.forEach((row) => {
    const s = getStats(row[idField]);
    s.ratingTotal += Number(row.overall_rating) || 0;
    s.reviewCount += 1;
  });

  workStyles.forEach((row) => {
    if (!row.remote_policy) return;
    const s = getStats(row[idField]);
    s.remotePolicyCounts[row.remote_policy] =
      (s.remotePolicyCounts[row.remote_policy] || 0) + 1;
  });

  const result = new Map<number, CompareStats>();

  ids.forEach((id) => {
    const s = statsById.get(id);

    if (!s) {
      result.set(id, EMPTY_STATS);
      return;
    }

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

    result.set(id, {
      averageSalary:
        s.salaryCount > 0 ? Math.round(s.salaryTotal / s.salaryCount) : 0,
      salaryCount: s.salaryCount,
      averageRating: s.reviewCount > 0 ? s.ratingTotal / s.reviewCount : 0,
      reviewCount: s.reviewCount,
      workStyleLabel,
      workStyleCount,
    });
  });

  return result;
}

export default function CompareView({
  mode,
  roleId,
  roleName,
  companyId,
  companyName,
  experience,
  city,
  year,
}: Props) {
  // -------------------- Company mode --------------------
  const [visibleSlots, setVisibleSlots] = useState(2);

  const [inputs, setInputs] = useState<string[]>(["", "", ""]);

  const [companies, setCompanies] = useState<(CompanyInfo | null)[]>([
    null,
    null,
    null,
  ]);

  const [stats, setStats] = useState<(CompareStats | null)[]>([
    null,
    null,
    null,
  ]);

  // Per-slot request counter — a fast reselect (or clear) on a slow
  // connection can otherwise let a stale fetch resolve after a newer one
  // and overwrite it, since both target the same slot index.
  const selectRequestIds = useRef<number[]>([0, 0, 0]);

  const selectCompany = async (index: number, company: any) => {
    const requestId = ++selectRequestIds.current[index];

    const { data } = await supabase
      .from("companies")
      .select("id, name, slug, industry, hq_city")
      .eq("id", company.id)
      .single();

    if (selectRequestIds.current[index] !== requestId) return;

    setCompanies((prev) =>
      prev.map((c, i) => (i === index ? (data as CompanyInfo) : c))
    );
  };

  const clearSlot = (index: number) => {
    selectRequestIds.current[index]++;

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

      // experience_years is a bucket id (see experienceLevels.ts), not a
      // literal year count — exact match, not a range.
      if (experience) {
        salariesQuery = salariesQuery.eq("experience_years", experience);
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

      const statsById = aggregateStats(
        companyIds,
        salaries || [],
        reviews || [],
        workStyles || [],
        "company_id"
      );

      setStats((prev) =>
        prev.map((_, i) => {
          const c = companies[i];
          if (!c) return null;

          return statsById.get(c.id) || EMPTY_STATS;
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
      (p): p is { company: CompanyInfo; stats: CompareStats | null } =>
        p !== null
    );

  const getIndustryName = (id: number | null) =>
    INDUSTRIES.find((industry) => industry.id === id)?.name || "-";

  const getCityName = (id: number | null) =>
    turkishCities.find((c) => c.id === id)?.name || "-";

  // -------------------- Role mode --------------------
  const [roleVisibleSlots, setRoleVisibleSlots] = useState(2);

  const [roleInputs, setRoleInputs] = useState<string[]>(["", "", ""]);

  const [selectedRoleIds, setSelectedRoleIds] = useState<
    (number | null)[]
  >([null, null, null]);

  const [roleStats, setRoleStats] = useState<(CompareStats | null)[]>([
    null,
    null,
    null,
  ]);

  const clearRoleSlot = (index: number) => {
    setRoleInputs((prev) => prev.map((v, i) => (i === index ? "" : v)));
    setSelectedRoleIds((prev) => prev.map((id, i) => (i === index ? null : id)));

    if (index === 2) setRoleVisibleSlots(2);
  };

  const activeRoleIds = selectedRoleIds
    .filter((id): id is number => id !== null)
    .join(",");

  // Same shape as the company-mode effect above, just grouped by role_id
  // instead of company_id. Symmetric to company mode's roleId narrowing —
  // an optional companyId (from Explore's toolbar, swapped in for the Rol
  // filter while this mode is active) narrows every role down to just
  // that one company's data instead of across all companies.
  useEffect(() => {
    if (!activeRoleIds) {
      setRoleStats([null, null, null]);
      return;
    }

    let cancelled = false;

    const roleIds = activeRoleIds.split(",").map(Number);

    const run = async () => {
      let salariesQuery = supabase
        .from("salaries")
        .select("salary, role_id")
        .in("role_id", roleIds)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");

      if (companyId) salariesQuery = salariesQuery.eq("company_id", companyId);

      // experience_years is a bucket id (see experienceLevels.ts), not a
      // literal year count — exact match, not a range.
      if (experience) {
        salariesQuery = salariesQuery.eq("experience_years", experience);
      }

      if (city) salariesQuery = salariesQuery.eq("work_city", city);

      if (year) {
        salariesQuery = salariesQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      let reviewsQuery = supabase
        .from("company_reviews")
        .select("overall_rating, role_id")
        .in("role_id", roleIds)
        .eq("moderation_status", "approved");

      if (companyId) reviewsQuery = reviewsQuery.eq("company_id", companyId);

      if (year) {
        reviewsQuery = reviewsQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      let workStylesQuery = supabase
        .from("company_work_style")
        .select("remote_policy, role_id")
        .in("role_id", roleIds)
        .eq("moderation_status", "approved")
        .eq("role_status", "approved")
        .eq("company_status", "approved");

      if (companyId) workStylesQuery = workStylesQuery.eq("company_id", companyId);

      if (city) workStylesQuery = workStylesQuery.eq("work_city", city);

      if (year) {
        workStylesQuery = workStylesQuery
          .gte("created_at", `${year}-01-01T00:00:00.000Z`)
          .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
      }

      const [{ data: salaries }, { data: reviews }, { data: workStyles }] =
        await Promise.all([salariesQuery, reviewsQuery, workStylesQuery]);

      if (cancelled) return;

      const statsById = aggregateStats(
        roleIds,
        salaries || [],
        reviews || [],
        workStyles || [],
        "role_id"
      );

      setRoleStats((prev) =>
        prev.map((_, i) => {
          const id = selectedRoleIds[i];
          if (id === null) return null;

          return statsById.get(id) || EMPTY_STATS;
        })
      );
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoleIds, companyId, experience, city, year]);

  const activeRolePairs = selectedRoleIds
    .map((id, i) =>
      id !== null ? { id, name: roleInputs[i], stats: roleStats[i] } : null
    )
    .filter(
      (p): p is { id: number; name: string; stats: CompareStats | null } =>
        p !== null
    );

  return (
    <div>
      {/* Ne karşılaştırıldığı, hangi filtreyle daraltıldığı — tablonun
          üstünde bir başlık olmadan bu bir anda belirsizleşiyordu. */}
      <div className="text-center text-2xl text-[var(--text-dark)] mb-4">
        {mode === "company" ? (
          roleName ? (
            <>
              <span className="font-medium text-[var(--text-dark)]">
                {roleName}
              </span>
              <span className="ml-1.5 text-[var(--muted-dark)]">
           
                için Şirket Karşılaştırması
              </span>
            </>
          ) : (
            <>
            <span className="font-medium text-[var(--text-dark)]">Şirket</span>
            <span className="ml-1.5 text-[var(--muted-dark)]">Karşılaştır</span>
          </>
          )
        ) : companyName ? (
          <>
            <span className="font-medium text-[var(--text-dark)]">
              {companyName}
            </span>
            <span className="ml-1.5 text-[var(--muted-dark)]">
          
              için Rol Karşılaştırması
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-[var(--text-dark)]">Rol</span>
            <span className="ml-1.5 text-[var(--muted-dark)]">Karşılaştır</span>
          </>
        )}
      </div>

      {year && (
        <p className="text-xs text-[var(--muted-dark)] mb-4">
          * Enflasyon etkisi hesaba katılmamıştır — rakamlar
          paylaşıldıkları tarihteki nominal değerlerdir.
        </p>
      )}

      {mode === "company" ? (
        <>
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
                      placeholder={`${index + 1}. Şirket ara...`}
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
                  hidden sm:flex items-center justify-center gap-2
                  text-[var(--muted-dark)]
                  hover:text-[var(--text-dark)]
                "
              >
                <Plus size={16} />
                3. Şirket ekle
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
                            ? `${s.averageSalary.toLocaleString("tr-TR")}₺`
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
        </>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3 mb-8">
            {SLOTS.slice(0, roleVisibleSlots).map((index) => (
              <div key={index} className="relative">
                {selectedRoleIds[index] !== null ? (
                  <div className="form-field flex items-center justify-between">
                    <span className="truncate">{roleInputs[index]}</span>

                    <button
                      type="button"
                      onClick={() => clearRoleSlot(index)}
                      className="text-black/40 hover:text-black/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <RoleAutocomplete
                      roleSearch={roleInputs[index]}
                      setRoleSearch={(value) =>
                        setRoleInputs((prev) =>
                          prev.map((v, i) => (i === index ? value : v))
                        )
                      }
                      selectedRoleId={selectedRoleIds[index]}
                      onSelect={(id) =>
                        setSelectedRoleIds((prev) =>
                          prev.map((v, i) => (i === index ? id : v))
                        )
                      }
                      searchOnly
                      placeholder={`${index + 1}. Rol ara...`}
                      inputClassName={index === 2 ? "pr-8" : ""}
                    />

                    {index === 2 && (
                      <button
                        type="button"
                        onClick={() => clearRoleSlot(2)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}

            {roleVisibleSlots < 3 && (
              <button
                type="button"
                onClick={() => setRoleVisibleSlots(3)}
                style={{ borderStyle: "dashed" }}
                className="
                  form-field
                  hidden sm:flex items-center justify-center gap-2
                  text-[var(--muted-dark)]
                  hover:text-[var(--text-dark)]
                "
              >
                <Plus size={16} />
                3. Rol ekle
              </button>
            )}
          </div>

          {activeRolePairs.length < 2 ? (
            <ContentEmptyState
              title="En Az İki Rol Seç"
              message="Karşılaştırmaya başlamak için yukarıdaki kutulardan en az 2 rol ara ve seç, karşılaştırma tablosu burada görünecek."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-[var(--muted-dark)] pb-3 pr-4" />

                    {activeRolePairs.map(({ id, name }) => (
                      <th key={id} className="text-left pb-3 px-4">
                        <Link
                          href={`/roles/${id}-${slugifyText(name)}`}
                          className="font-semibold text-[var(--text-dark)] hover:underline"
                        >
                          {name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t border-black/5">
                    <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                      Ortalama Puan
                    </td>

                    {activeRolePairs.map(({ id, stats: s }) => (
                      <td key={id} className="py-3 px-4 text-[var(--text-dark)]">
                        {s ? `★ ${s.averageRating.toFixed(1)}` : "…"}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-black/5">
                    <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                      Yorum Sayısı
                    </td>

                    {activeRolePairs.map(({ id, stats: s }) => (
                      <td key={id} className="py-3 px-4 text-[var(--text-dark)]">
                        {s ? s.reviewCount : "…"}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-black/5">
                    <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                      Ortalama Maaş
                    </td>

                    {activeRolePairs.map(({ id, stats: s }) => (
                      <td key={id} className="py-3 px-4 text-[var(--text-dark)]">
                        {s
                          ? s.averageSalary > 0
                            ? `${s.averageSalary.toLocaleString("tr-TR")}₺`
                            : "-"
                          : "…"}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-black/5">
                    <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                      Maaş Verisi
                    </td>

                    {activeRolePairs.map(({ id, stats: s }) => (
                      <td key={id} className="py-3 px-4 text-[var(--text-dark)]">
                        {s ? s.salaryCount : "…"}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-black/5">
                    <td className="py-3 pr-4 text-sm text-[var(--muted-dark)] whitespace-nowrap">
                      Çalışma Şekli
                    </td>

                    {activeRolePairs.map(({ id, stats: s }) => (
                      <td key={id} className="py-3 px-4 text-[var(--text-dark)]">
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
        </>
      )}
    </div>
  );
}
