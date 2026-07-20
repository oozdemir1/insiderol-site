import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
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

  return {
    title: `${company.name} Maaşları ve Çalışan Yorumları | insiderol`,

    description:
      `${company.name} maaşları, çalışan yorumları, ratingler ve salary insights.`,
  };
}


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

const { data: salaries } = await supabase
  .from("salaries")
  .select("*")
  .eq("company_id", company.id)
  .eq("moderation_status", "approved")
  .eq("role_status", "approved")
  .eq("company_status", "approved");

    
    const { data: reviews } = await supabase
      .from("company_reviews")
      .select("*")
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

  const salaryRisePolicyLabels: Record<string, string> = {
  yearly: "Yılda 1 kez",
  every_6_months: "6 ayda 1",
  inflation_based: "Enflasyon bazlı",
  performance_based: "Performans bazlı",
  minimum_wage_based: "Asgari ücret bazlı",
  irregular: "Düzensiz",
  no_raise: "Zam yapılmıyor",
}; 

  const overtimePolicyLabels: Record<string, string> = {
  none: "Mesai yok",
  rare: "Nadiren mesai",
  sometimes: "Ara sıra mesai",
  frequent: "Sık mesai",
  constant: "Sürekli mesai",
  weekend_common: "Hafta sonu çalışması yaygın",
};

const companyCityName =
  turkishCities.find(
    (city) => city.id === company.hq_city
  )?.name || "Bilinmiyor";

  return (
    <>
<main
  style={{ backgroundColor: "var(--background)" }}
  className="h-auto text-[var(--text-dark)] pt-0 px-4 pb-20 relative z-0"
>
  <div className="w-full max-w-6xl mx-auto px-4">
      <CompanyPageClient
        company={company}
        reviews={reviews || []}
        companyId={company.id}
        companyName={company.name}
        hqCity={company.hq_city}
        initialTab={tab === "maaş" ? "maaş" : "yorum"}
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
          {company.logo_url && company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block relative"
            >
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
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-24 h-24 object-contain"
                />
              </div>
            </a>
          )}
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