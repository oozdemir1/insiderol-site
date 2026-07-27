import { createClient } from "@/lib/server";
import Hero from "@/components/Hero";
import StatsSection from "@/components/sections/StatsSection";
import HowItWorks from "@/components/sections/HowItWorks";
import SalaryPreviewSection from "@/components/sections/SalaryPreviewSection";
import LatestReviews from "@/components/sections/LatestReviews";
import CommunityCTA from "@/components/sections/CommunityCTA";
import CompanyShowcase from "@/components/sections/CompanyShowcase";
import RoleShowcase from "@/components/sections/RoleShowcase";

const SHOWCASE_COMPANY_COUNT = 10;
const SHOWCASE_ROLE_COUNT = 10;

function pickRandom<T>(items: T[], count: number): T[] {
  return items
    .map((item) => ({ item, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, count)
    .map(({ item }) => item);
}

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { count: companyCount },
    { data: allCompanies },
    { count: roleCount },
    { data: allRoles },
    { count: salaryCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("name, slug, logo_url"),
    supabase.from("roles").select("id", { count: "exact", head: true }),
    supabase.from("roles").select("id, name"),
    supabase
      .from("salaries")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved")
      .eq("role_status", "approved")
      .eq("company_status", "approved"),
    supabase
      .from("company_reviews")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved"),
  ]);

  const showcaseCompanies = pickRandom(
    allCompanies || [],
    SHOWCASE_COMPANY_COUNT
  );

  const showcaseRoles = pickRandom(allRoles || [], SHOWCASE_ROLE_COUNT);

  return (
    <main>
      <Hero />

      <StatsSection
        companyCount={companyCount || 0}
        salaryCount={salaryCount || 0}
        reviewCount={reviewCount || 0}
      />

      <HowItWorks />

      <CompanyShowcase
        companies={showcaseCompanies}
        totalCount={companyCount || 0}
      />

      <SalaryPreviewSection />

      <RoleShowcase roles={showcaseRoles} totalCount={roleCount || 0} />

      <LatestReviews />

      <CommunityCTA />
    </main>
  );
}
