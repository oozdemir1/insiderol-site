import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import SalaryForm from "@/components/forms/SalaryForm";
import { ShieldCheck } from "lucide-react";

type EditSalaryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSalaryPage({
  params,
}: EditSalaryPageProps) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: salary } =
    await supabase
      .from("salaries")
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

  if (!salary) {
    notFound();
  }

  const transformedSalary = {
    ...salary,

    companyId:
      salary.company_id,

    companyName:
      salary.companies?.name || "",

    hqCity:
      salary.companies?.hq_city || null,

    companyWebsite:
      salary.companies?.website || "",

    workCity:
      salary.work_city || null,
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
                Maaş
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>


        <div className="mt-6">

          <SalaryForm
            showHeader={false}
            mode="edit"
            initialData={transformedSalary}
          />

        </div>

      </div>

    </main>

  );
}