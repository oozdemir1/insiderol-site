import { createClient } from "@/lib/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { slugifyText } from "@/app/constants/normalizationUtils";
import RolePageClient from "./RolePageClient";

type RolePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: RolePageProps): Promise<Metadata> {

  const { id } = await params;
  const roleId = parseInt(id, 10);
  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", roleId)
    .maybeSingle();

  return {
    title: role
      ? `${role.name} Maaşları ve Şirket Karşılaştırması`
      : "Pozisyon",

    description: role
      ? `${role.name} pozisyonu için şirketlere göre maaş ve değerlendirme karşılaştırması.`
      : undefined,

    alternates: role
      ? { canonical: `/roles/${roleId}-${slugifyText(role.name)}` }
      : undefined,
  };
}

export default async function RolePage({
  params,
}: RolePageProps) {

  const { id } = await params;
  const roleId = parseInt(id, 10);

  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", roleId)
    .maybeSingle();

  if (!role) {
    notFound();
  }

  // Fetched broad (role-scoped only, no experience/city/year narrowing) —
  // those filters now live client-side in RolePageClient, same as the
  // company page's SelectDropdown filters, instead of round-tripping to
  // the server on every filter change.
  const { data: salaries } = await supabase
    .from("salaries")
    .select(
      "id, salary, experience_years, work_city, company_id, created_at, companies(name, slug, logo_url)"
    )
    .eq("role_id", roleId)
    .eq("moderation_status", "approved")
    .eq("role_status", "approved")
    .eq("company_status", "approved");

  const { data: reviews } = await supabase
    .from("company_reviews")
    .select("id, overall_rating, company_id, created_at")
    .eq("role_id", roleId)
    .eq("moderation_status", "approved");

  const { data: workStyles } = await supabase
    .from("company_work_style")
    .select("id, remote_policy, work_city, company_id, created_at")
    .eq("role_id", roleId)
    .eq("moderation_status", "approved")
    .eq("role_status", "approved")
    .eq("company_status", "approved");

  // Supabase's generated types infer a to-one join as an array (it can't
  // prove uniqueness from the query shape alone) — normalize to a single
  // object here so RolePageClient can stay strictly typed instead of
  // falling back to `any`.
  const normalizedSalaries = (salaries || []).map((s: any) => ({
    ...s,
    companies: Array.isArray(s.companies) ? s.companies[0] ?? null : s.companies,
  }));

  return (
    <main
      style={{ backgroundColor: "var(--background)" }}
      className="h-auto text-[var(--text-dark)] pt-0 px-4 pb-20 relative z-0"
    >
      <div className="w-full max-w-6xl mx-auto px-4">
        <RolePageClient
          roleName={role.name}
          salaries={normalizedSalaries}
          reviews={reviews || []}
          workStyles={workStyles || []}
        />
      </div>
    </main>
  );
}
