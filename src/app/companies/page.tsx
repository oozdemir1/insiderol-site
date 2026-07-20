import { createClient } from "@/lib/server";
import { Search } from "lucide-react";
import CompaniesList from "./CompaniesList";
import SortDropdown from "./SortDropdown";
import CityFilter from "./CityFilter";
import IndustryTypeahead from "./IndustryTypeahead";
import RatingFilter from "./RatingFilter";
import { normalizeSearchText } from "../constants/normalizationUtils";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 24;

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
  const currentPage = Math.max(1, Number(page) || 1);
  const hasFilters =
  !!searchQuery ||
  !!industryFilter ||
  !!hqCityFilter ||
  !!averageRatingFilter;

  let query = supabase
    .from("companies")
    .select(`
      *,
      company_reviews(id),
      salaries(id)
    `, { count: "exact" });

if (searchQuery) {
  query = query.ilike(
    "search_name",
    `%${normalizeSearchText(searchQuery)}%`
  );
}
 
  if (industryFilter) {
  query = query.eq(
    "industry",
    Number(industryFilter)
  );
}

if (hqCityFilter) {
  query = query.eq(
    "hq_city",
    Number(hqCityFilter)
  );
}

if (averageRatingFilter) {
  query = query.gte(
    "average_rating",
    Number(averageRatingFilter)
  );
}



if (sortFilter === "newest") {
  query = query.order(
    "created_at",
    {
      ascending: false,
    }
  );

} else if (sortFilter === "rating") {
  query = query
    .order("average_rating", {
      ascending: false,
    })
    .order("review_count", {
      ascending: false,
    });

} else if (sortFilter === "reviews") {
  query = query
    .order("review_count", {
      ascending: false,
    })
    .order("average_rating", {
      ascending: false,
    });

} else if (sortFilter === "salary") {
  query = query
    .order("average_salary", {
      ascending: false,
    })
    .order("salary_count", {
      ascending: false,
    });

} else if (sortFilter === "salaryCount") {
  query = query
    .order("salary_count", {
      ascending: false,
    })
    .order("average_salary", {
      ascending: false,
    });

} else {
  query = query.order("name", {
    ascending: true,
  });
}

query = query.range(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE - 1
);

const { data: companies, error, count } =
  await query;


  if (error) {
    console.error(error);
  }

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
    href={
      industry
        ? `/companies?industry=${industry}`
        : "/companies"
    }
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