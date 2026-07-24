import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { turkishCities } from "@/app/constants/turkishCities";
import CompanyPageClient from "@/components/CompanyPageClient";


type CompanyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};


export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {

  const { slug } = await params;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!company) {
    return { title: "Şirket bulunamadı | insiderol" };
  }

  return {
    title: `${company.name} Maaşları ve Çalışan Yorumları | insiderol`,

    description:
      `${company.name} maaşları, çalışan yorumları, ratingler ve salary insights.`,
  };
}


const VALID_TABS = [
  "yorum",
  "maaş",
  "çalışma biçimi",
  "yan hak",
  "ücret politikası",
  "mülakat süreci",
] as const;

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}) {

  const { slug } = await params;
  const { tab } = await searchParams;

  const companyName =
    slug.charAt(0).toUpperCase() + slug.slice(1);

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!company) {
    notFound();
  }

const { data: salaries } = await supabase
  .from("salaries")
  .select("*, roles(name)")
  .eq("company_id", company.id)
  .eq("moderation_status", "approved")
  .eq("role_status", "approved")
  .eq("company_status", "approved")
  .order("created_at", { ascending: false });


    const { data: reviews } = await supabase
      .from("company_reviews")
      .select("*, roles(name)")
      .eq("company_id", company.id)
      .eq(
        "moderation_status",
        "approved"
      )
      .order("created_at", {
        ascending: false,
      });

    const averageReviewRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce(
            (acc, curr) =>
              acc + (curr.overall_rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0";

  const totalSalaries = salaries?.length || 0;

  const numericSalaries =
  salaries?.map((salary) =>
    Number(salary.salary)
  ) || [];

  const averageSalary =
    numericSalaries.length > 0
        ? Math.round(
            numericSalaries.reduce(
            (acc, curr) => acc + curr,
            0
            ) / numericSalaries.length
        )
        : 0;

  const salaryRange =
    numericSalaries.length > 0
      ? {
          min: Math.min(...numericSalaries),
          max: Math.max(...numericSalaries),
        }
      : null;

  // Averages for the 6 review sub-ratings, used by the numeric overview
  // bars — computed from already-fetched data instead of a second query.
  const subRatingFields = [
    "work_life_balance",
    "management",
    "career_growth",
    "work_environment",
    "transparency",
    "employee_value",
  ] as const;

  const subRatingAverages = Object.fromEntries(
    subRatingFields.map((field) => {
      const average =
        reviews && reviews.length > 0
          ? reviews.reduce(
              (acc, curr) => acc + (curr[field] || 0),
              0
            ) / reviews.length
          : 0;

      return [field, average];
    })
  ) as Record<(typeof subRatingFields)[number], number>;

  const initialTab = (
    VALID_TABS as readonly string[]
  ).includes(tab || "")
    ? (tab as (typeof VALID_TABS)[number])
    : "yorum";

const companyCityName =
  turkishCities.find(
    (city) => city.id === company.hq_city
  )?.name || "Bilinmiyor";

  // Logo/website may each be missing independently (most companies are
  // approved without either — see admin/moderation's approve flow), so
  // render whichever combination is available instead of hiding the whole
  // block when only one is set.
  const logoBox = (
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
      {company.logo_url ? (
        <img
          src={company.logo_url}
          alt={company.name}
          className="w-24 h-24 object-contain"
        />
      ) : (
        <span className="text-3xl font-semibold text-[var(--accent)]">
          {company.name?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );

  const logoContent = company.website ? (
    <a
      href={company.website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block relative"
    >
      {logoBox}
    </a>
  ) : (
    logoBox
  );

  // Only emit a rating snippet when real reviews back it — an
  // aggregateRating with zero underlying reviews violates Google's
  // structured-data guidelines and can get the markup penalized.
  const structuredDataJson =
    reviews && reviews.length > 0
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: company.name,
          ...(company.website ? { url: company.website } : {}),
          ...(company.logo_url ? { logo: company.logo_url } : {}),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageReviewRating,
            reviewCount: reviews.length,
            bestRating: "5",
            worstRating: "1",
          },
        }).replace(/</g, "\\u003c")
      : null;

  return (
    <>
{structuredDataJson && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: structuredDataJson }}
  />
)}
<main
  style={{ backgroundColor: "var(--background)" }}
  className="h-auto text-[var(--text-dark)] pt-0 px-4 pb-20 relative z-0"
>
  <div className="w-full max-w-6xl mx-auto px-4">
      <CompanyPageClient
        company={company}
        reviews={reviews || []}
        salaries={salaries || []}
        companyId={company.id}
        companyName={company.name}
        hqCity={company.hq_city}
        initialTab={initialTab}
        subRatingAverages={subRatingAverages}
        salaryRange={salaryRange}
        reviewCount={reviews?.length || 0}
      >

     
    {/* Unified Header + Content Card */}
<div
  className="
  bg-gradient-to-br
    border border-black/10
    bg-gradient-to-br
   from-white
    via-zinc-50
    to-zinc-100
    rounded-[0.75rem]
    p-3 md:p-5    
  "
>
 {/* Page Header */}
      <div className=" 
            flex items-center
            justify-center
            text-center
            text-2xl
            text-[var(--text-dark)]
            mb-4
           ">

        
          <span className="font-medium text-[var(--text-dark)]">
            {company.name}
          </span>
           <span className="ml-1.5 text-black/50">{" "} Çalışan Deneyimleri</span>

      
      </div>

      {/* Logo + Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-8">

        {/* Logo */}
        <div className="flex-shrink-0 self-center text-center md:text-left relative mb-6 md:mb-0">
          {logoContent}
        </div>

        <div className="hidden md:block w-px h-15 self-center bg-black/10" />

        {/* Stats Cards */}
        <div className="flex-1 flex flex-col md:items-start items-center gap-4">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <p className="text-[var(--text-dark)] text-[20px] font-semibold tracking-tight leading-none">
                ⭐{averageReviewRating}
              </p>
              <span className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Ortalama Puan
              </span>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {totalSalaries}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Maaş Paylaşımı
              </p>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                ₺{averageSalary.toLocaleString()}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Ortalama Maaş
              </p>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {reviews?.length}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Değerlendirme
              </p>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-3 text-center">
              <div className="text-[18px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {companyCityName}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-1">
                Merkez Konum
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>

</CompanyPageClient>
  </div>
</main>
</>
  );
}