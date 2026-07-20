import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import BenefitsForm from "@/components/forms/BenefitsForm";
import { ShieldCheck } from "lucide-react";

type EditBenefitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditWBenefitPage({
  params,
}: EditBenefitPageProps) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: benefit } =
    await supabase
      .from("company_benefits")
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

  if (!benefit) {
    notFound();
  }


 const transformedBenefit = {
  ...benefit,

  company_id:
    benefit.company_id,

  roleName:
    benefit.roles?.name || "",

  companyName:
    benefit.companies?.name || "",

  hqCity:
    benefit.companies?.hq_city || null,

  companyWebsite:
    benefit.companies?.website || "",

  workCity:
    benefit.work_city || null,
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
                Yan Hak
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>


        <div className="mt-6">

          <BenefitsForm
            showHeader={false}
            mode="edit"
            initialData={transformedBenefit}
            />

        </div>

      </div>

    </main>

  );
}