import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { turkishCities } from "@/app/constants/turkishCities";
import { INDUSTRIES } from "@/app/constants/industries";
import CompanyPageClient from "@/components/CompanyPageClient";
import CompanyHeaderCard from "@/components/CompanyHeaderCard";


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
    return { title: "Şirket bulunamadı" };
  }

  return {
    title: `${company.name} Maaşları ve Çalışan Yorumları`,

    description:
      `${company.name} maaşları, çalışan yorumları, ratingler ve salary insights.`,

    alternates: {
      canonical: `/companies/${slug}`,
    },
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

    // Only look up profiles for non-anonymous posts — an anonymous post's
    // author shouldn't even reach the client, not just stay unrendered
    // (same pattern as the /explore feed).
    const identifiableUserIds = Array.from(
      new Set(
        [...(salaries || []), ...(reviews || [])]
          .filter((row) => !row.is_anonymous && row.user_id)
          .map((row) => row.user_id)
      )
    );

    const profileByUserId = new Map<
      string,
      { username: string | null; avatar_url: string | null }
    >();

    if (identifiableUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", identifiableUserIds);

      (profiles || []).forEach((profile: any) => {
        profileByUserId.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url,
        });
      });
    }

    // user_id (select("*") includes it) must never reach the client — it
    // was leaking here even on anonymous rows, since the early return
    // below used to hand back the raw row unchanged.
    const withAuthor = (rows: any[]) =>
      rows.map((row) => {
        const { user_id, ...rest } = row;

        if (row.is_anonymous || !user_id) return rest;

        const profile = profileByUserId.get(user_id);

        return {
          ...rest,
          authorUsername: profile?.username ?? null,
          authorAvatarUrl: profile?.avatar_url ?? null,
        };
      });

    const salariesWithAuthor = withAuthor(salaries || []);
    const reviewsWithAuthor = withAuthor(reviews || []);

    const averageReviewRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce(
            (acc, curr) =>
              acc + (curr.overall_rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

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

  const initialTab = (
    VALID_TABS as readonly string[]
  ).includes(tab || "")
    ? (tab as (typeof VALID_TABS)[number])
    : "yorum";

const companyCityName =
  turkishCities.find(
    (city) => city.id === company.hq_city
  )?.name || "Bilinmiyor";

const industryName =
  INDUSTRIES.find(
    (industry) => industry.id === Number(company.industry)
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
        reviews={reviewsWithAuthor}
        salaries={salariesWithAuthor}
        companyId={company.id}
        companyName={company.name}
        hqCity={company.hq_city}
        initialTab={initialTab}
      >

    {/* Unified Header + Content Card */}
    <CompanyHeaderCard
      companyName={company.name}
      logoContent={logoContent}
      companyCityName={companyCityName}
      averageReviewRating={averageReviewRating}
      reviewCount={reviews?.length || 0}
      averageSalary={averageSalary}
      salaryCount={totalSalaries}
      industryName={industryName}
    />

</CompanyPageClient>
  </div>
</main>
</>
  );
}