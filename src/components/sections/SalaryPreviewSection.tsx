import { createClient } from "@/lib/server";
import { Banknote } from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";
import { getExperienceYearsLabel, getCityName } from "@/app/constants/lookupHelpers";
import SalaryPreviewCarousel, { type SalaryPreviewItem } from "./SalaryPreview";

const LATEST_COUNT = 12;

export default async function SalaryPreviewSection() {
  const supabase = await createClient();

  const { data: salaries } = await supabase
    .from("salaries")
    .select(
      "id, salary, experience_years, work_city, tech_stack, comment, roles(name)"
    )
    .eq("moderation_status", "approved")
    .eq("role_status", "approved")
    .eq("company_status", "approved")
    .order("created_at", { ascending: false })
    .limit(LATEST_COUNT);

  const items: SalaryPreviewItem[] = (salaries || [])
    .filter((salary: any) => salary.roles)
    .map((salary: any) => ({
      role: salary.roles.name,
      salary: Number(salary.salary) || 0,
      experienceLabel: getExperienceYearsLabel(salary.experience_years),
      cityLabel: getCityName(salary.work_city),
      techStack: salary.tech_stack,
      comment: salary.comment,
    }));

  if (items.length === 0) {
    return (
      <section className="py-28 bg-[var(--section-light-2)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-dark)]">
              Maaş Paylaşımları
            </h2>
            <p className="text-[var(--muted-dark)] text-lg mt-3">
              Henüz paylaşılan bir maaş kaydı yok
            </p>
          </div>

          <EmptyStateCard
            icon={Banknote}
            title="İlk maaşı sen paylaş"
            body="Anonim maaş bilgin, başkalarının teklifleri değerlendirirken daha bilinçli karar vermesini sağlar."
            ctaLabel="Maaş Paylaş"
            ctaHref="/share?tab=Maaş"
          />
        </div>
      </section>
    );
  }

  return <SalaryPreviewCarousel salaries={items} />;
}
