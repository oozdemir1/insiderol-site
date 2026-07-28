import { createClient } from "@/lib/server";
import type { Metadata } from "next";
import RolesList from "./RolesList";
import SortDropdown from "./SortDropdown";
import RoleSearchBar from "./RoleSearchBar";
import Pagination from "@/components/Pagination";
import { normalizeSearchText } from "../constants/normalizationUtils";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Pozisyonlar",
  description:
    "Pozisyona göre şirketleri karşılaştır: anonim maaş, değerlendirme ve çalışma şekli verileriyle.",
  alternates: {
    canonical: "/roles",
  },
};

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
}) {

  const supabase = await createClient();
  const { q, sort, page } = await searchParams;

  const searchQuery = q?.trim() || "";
  const sortFilter = sort?.trim() || "";
  const currentPage = Math.max(1, Number(page) || 1);

  let rolesQuery = supabase
    .from("roles")
    .select("id, name");

  if (searchQuery) {
    rolesQuery = rolesQuery.ilike(
      "normalized_name",
      `%${normalizeSearchText(searchQuery)}%`
    );
  }

  const { data: roles, error } = await rolesQuery;

  if (error) {
    console.error(error);
  }

  // Roles carry no precomputed counters (unlike `companies`), so the
  // aggregates are built here from the approved rows directly — same
  // live-aggregation approach the company detail page already uses.
  const { data: salaries } = await supabase
    .from("salaries")
    .select("role_id, salary, salary_satisfaction")
    .eq("moderation_status", "approved")
    .eq("role_status", "approved")
    .eq("company_status", "approved");

  const { data: reviews } = await supabase
    .from("company_reviews")
    .select("role_id")
    .eq("moderation_status", "approved");

  const statsByRole = new Map<
    number,
    {
      salaryTotal: number;
      salaryCount: number;
      satisfactionTotal: number;
      satisfactionCount: number;
      reviewCount: number;
    }
  >();

  const getStats = (roleId: number) => {
    let stats = statsByRole.get(roleId);

    if (!stats) {
      stats = {
        salaryTotal: 0,
        salaryCount: 0,
        satisfactionTotal: 0,
        satisfactionCount: 0,
        reviewCount: 0,
      };

      statsByRole.set(roleId, stats);
    }

    return stats;
  };

  (salaries || []).forEach((salary) => {
    if (!salary.role_id) return;

    const stats = getStats(salary.role_id);

    stats.salaryTotal += Number(salary.salary) || 0;
    stats.salaryCount += 1;

    if (salary.salary_satisfaction) {
      stats.satisfactionTotal += Number(salary.salary_satisfaction);
      stats.satisfactionCount += 1;
    }
  });

  (reviews || []).forEach((review) => {
    if (!review.role_id) return;

    getStats(review.role_id).reviewCount += 1;
  });

  const rolesWithStats = (roles || []).map((role) => {
    const stats = statsByRole.get(role.id);

    const salaryCount = stats?.salaryCount || 0;
    const satisfactionCount = stats?.satisfactionCount || 0;
    const reviewCount = stats?.reviewCount || 0;

    return {
      ...role,
      salaryCount,
      reviewCount,
      averageSalary:
        salaryCount > 0
          ? Math.round(stats!.salaryTotal / salaryCount)
          : 0,
      averageSatisfaction:
        satisfactionCount > 0
          ? stats!.satisfactionTotal / satisfactionCount
          : 0,
    };
  });

  if (sortFilter === "satisfaction") {
    rolesWithStats.sort(
      (a, b) => b.averageSatisfaction - a.averageSatisfaction
    );
  } else if (sortFilter === "reviews") {
    rolesWithStats.sort(
      (a, b) => b.reviewCount - a.reviewCount
    );
  } else if (sortFilter === "salary") {
    rolesWithStats.sort(
      (a, b) => b.averageSalary - a.averageSalary
    );
  } else if (sortFilter === "salaryCount") {
    rolesWithStats.sort(
      (a, b) => b.salaryCount - a.salaryCount
    );
  } else {
    rolesWithStats.sort((a, b) =>
      a.name.localeCompare(b.name, "tr")
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(rolesWithStats.length / PAGE_SIZE)
  );

  // A stale ?page= (e.g. carried over from a broader search/sort into a
  // narrower one via RoleSearchBar/SortDropdown, both of which preserve
  // the existing page param) would otherwise return an empty slice with
  // no way back — clamp to the real last page instead.
  const clampedPage = Math.min(currentPage, totalPages);

  const pagedRoles = rolesWithStats.slice(
    (clampedPage - 1) * PAGE_SIZE,
    clampedPage * PAGE_SIZE
  );

  return (
    <>
      <div
        className="
          sticky
          top-20
          z-40
          bg-[var(--background)]
          backdrop-blur-2xl
          border-b
          border-black/10
          shadow-sm
          py-4
          mb-4
        "
      >
        <div className="container mx-auto px-4 max-w-7xl">

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2">
            <RoleSearchBar initialQuery={q || ""} />

            <div className="hidden md:block h-8 w-px bg-black/20" />

            <SortDropdown sort={sort || ""} />
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 pt-0 pb-8 w-full max-w-6xl">

        <div className="text-center mb-4">
          <span className="text-2xl font-semibold text-[var(--text-dark)]">
            {rolesWithStats.length}
          </span>

          <span className="ml-2 text-2xl text-[var(--muted-dark)]">
            Kayıtlı Pozisyon
          </span>
        </div>

        <RolesList roles={pagedRoles} />

        <Pagination
          basePath="/roles"
          currentPage={clampedPage}
          totalPages={totalPages}
          searchParams={{ q, sort }}
        />

      </div>
    </>
  );

}
