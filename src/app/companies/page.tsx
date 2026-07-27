import { createClient } from "@/lib/server";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import CompaniesList from "./CompaniesList";
import SortDropdown from "./SortDropdown";
import CityFilter from "./CityFilter";
import IndustryTypeahead from "./IndustryTypeahead";
import RatingFilter from "./RatingFilter";
import { normalizeSearchText } from "../constants/normalizationUtils";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 24;

// Filter/sort/pagination query params all resolve to the same underlying
// content set, just reordered/narrowed — canonicalize to the bare route so
// they don't compete with each other (or the real listing) in the index.
export const metadata: Metadata = {
  title: "Şirketler",
  description:
    "Türkiye'deki şirketleri anonim maaş, çalışan yorumu ve mülakat deneyimlerine göre keşfet, karşılaştır.",
  alternates: {
    canonical: "/companies",
  },
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{
  q?: string;
  industry?: string;
  hqCity?: string;
  averageRating?: string;
  sort?: string;
  page?: string;
}>;

}) {

  const supabase = await createClient();
  const { q, industry, hqCity, averageRating, sort, page } = await searchParams;

  const searchQuery = q?.trim() || "";
  const industryFilter = industry?.trim() || "";
  const hqCityFilter = hqCity?.trim() || "";
  const averageRatingFilter = averageRating?.trim() || "";
  const sortFilter = sort?.trim() || "";
  const requestedPage = Math.max(1, Number(page) || 1);

  // The "×" only clears the typed search text — it shouldn't also wipe
  // whichever other filters are active.
  const clearSearchHref = (() => {
    const params = new URLSearchParams();
    if (industryFilter) params.set("industry", industryFilter);
    if (hqCityFilter) params.set("hqCity", hqCityFilter);
    if (averageRatingFilter) params.set("averageRating", averageRatingFilter);
    if (sortFilter) params.set("sort", sortFilter);
    const qs = params.toString();
    return qs ? `/companies?${qs}` : "/companies";
  })();

  const hasFilters =
  !!searchQuery ||
  !!industryFilter ||
  !!hqCityFilter ||
  !!averageRatingFilter;

  // Rebuildable so an out-of-range page (stale bookmark, hand-edited URL)
  // can be re-queried with a clamped range once the real count is known,
  // instead of just silently returning an empty page with no way back.
  const buildFilteredQuery = () => {
    let q = supabase
      .from("companies")
      .select(`
        *,
        company_reviews(id),
        salaries(id)
      `, { count: "exact" });

    if (searchQuery) {
      q = q.ilike(
        "search_name",
        `%${normalizeSearchText(searchQuery)}%`
      );
    }

    if (industryFilter) {
      q = q.eq("industry", Number(industryFilter));
    }

    if (hqCityFilter) {
      q = q.eq("hq_city", Number(hqCityFilter));
    }

    if (averageRatingFilter) {
      q = q.gte("average_rating", Number(averageRatingFilter));
    }

    if (sortFilter === "newest") {
      q = q.order("created_at", { ascending: false });
    } else if (sortFilter === "rating") {
      q = q
        .order("average_rating", { ascending: false })
        .order("review_count", { ascending: false });
    } else if (sortFilter === "reviews") {
      q = q
        .order("review_count", { ascending: false })
        .order("average_rating", { ascending: false });
    } else if (sortFilter === "salary") {
      q = q
        .order("average_salary", { ascending: false })
        .order("salary_count", { ascending: false });
    } else if (sortFilter === "salaryCount") {
      q = q
        .order("salary_count", { ascending: false })
        .order("average_salary", { ascending: false });
    } else {
      q = q.order("name", { ascending: true });
    }

    return q;
  };

  let currentPage = requestedPage;

  let result = await buildFilteredQuery().range(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE - 1
  );

  if (result.error) {
    // PostgREST returns 416 "Range Not Satisfiable" (not just an empty
    // page) when the requested offset exceeds the real row count — count
    // comes back null on that response too, so re-fetch page 1 first to
    // learn the real total and land on its actual last page.
    console.error(result.error);

    const page1 = await buildFilteredQuery().range(0, PAGE_SIZE - 1);

    const realTotalPages = Math.max(
      1,
      Math.ceil((page1.count || 0) / PAGE_SIZE)
    );

    currentPage = Math.min(currentPage, realTotalPages);

    result =
      currentPage === 1
        ? page1
        : await buildFilteredQuery().range(
            (currentPage - 1) * PAGE_SIZE,
            currentPage * PAGE_SIZE - 1
          );

    if (result.error) {
      console.error(result.error);

      // The re-fetch at the clamped page failed on its own (separately
      // from the original out-of-range error) — fall back to the page 1
      // result we already have rather than showing a stale/empty page
      // with a misleading "0 Kayıtlı Şirket".
      currentPage = 1;
      result = page1;
    }
  }

  const companies = result.data;
  const count = result.count;

  const totalPages = Math.max(
    1,
    Math.ceil((count || 0) / PAGE_SIZE)
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
<form className="w-full">

<div className="flex items-center gap-2">
<div className="grid grid-cols-[220px_220px_140px_140px_auto_auto] gap-2">
<div className="relative">
  <input
    type="text"
    name="q"
    placeholder="Şirket ara..."
    defaultValue={q || ""}
    className="form-field w-full text-lg h-10 pr-10"
  />


{q ? (
  <a
    href={clearSearchHref}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
  >
    ✕
  </a>
) : (
<span className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
  <Search size={18} />
</span>
)}

</div>



<IndustryTypeahead defaultValue={industry || ""} />

<CityFilter defaultValue={hqCity || ""} />

<RatingFilter defaultValue={averageRating || ""} />

<button
  type="submit"
  className="form-btn  "
>
  Ara
</button>

<a
  href="/companies"
  className="form-btn form-btn-secondary"
>
  Temizle
</a>
</div>

<div className="h-8 w-px bg-black/20" />

<SortDropdown sort={sort || ""} />

</div>

</form>
</div>
</div>

  <div className="container mx-auto px-4 pt-0 pb-8 w-full max-w-6xl">
     
<div className="text-center mb-4">
  <div className="inline-flex items-center">
   

    <span className="text-2xl font-semibold text-[var(--text-dark)]">
      {count || 0}
    </span>

    <span className="ml-2 text-2xl text-[var(--muted-dark)]">
      Kayıtlı Şirket
    </span>
  </div>
</div>

<CompaniesList companies={companies || []} />

<Pagination
  basePath="/companies"
  currentPage={currentPage}
  totalPages={totalPages}
  searchParams={{
    q,
    industry,
    hqCity,
    averageRating,
    sort,
  }}
/>

</div>

    </>
  );
  
}