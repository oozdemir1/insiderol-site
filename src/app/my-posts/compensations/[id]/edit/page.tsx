import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import CompensationForm from "@/components/forms/CompensationForm";
import { ShieldCheck } from "lucide-react";

type EditCompensationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCompensationPage({
  params,
}: EditCompensationPageProps) {

  const { id } = await params;

const supabase =
  await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  notFound();
}

const { data: compensation } =
  await supabase
    .from("company_compensation")
    .select(`
        *,
        companies(
            name,
            hq_city,
            website
        ),
        roles(name)
        `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

if (!compensation) {
  notFound();
}

  const transformedCompensation = {
  ...compensation,

  company_id:
    compensation.company_id,

  roleName:
    compensation.roles?.name || "",

  companyName:
    compensation.companies?.name || "",

  hqCity:
    compensation.companies?.hq_city || null,

  companyWebsite:
    compensation.companies?.website || "",

  workCity:
    compensation.work_city || null,
};

return (

  <main className="w-full py-5 pb-16">

    <div className="max-w-6xl mx-auto px-4">

     <div
              className="
                flex items-center justify-center          
                gap-1
                mx-auto
                px-4 py-1
                text-2xl text-[var(--text-dark)]
                -mb-4
              "
            >
              <ShieldCheck
                size={24}
                  strokeWidth={2.75}
                className="mr-1 text-[var(--lime)]"
              />

              
              <span className="text-black/50">Anonim</span>
              <span className="font-medium text-[var(--text-dark)]">
                Ücret Politikası
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>

      <div className="mt-6">

        <CompensationForm
          showHeader={false}
          mode="edit"
          initialData={transformedCompensation}
        />

      </div>

    </div>

  </main>

);
}