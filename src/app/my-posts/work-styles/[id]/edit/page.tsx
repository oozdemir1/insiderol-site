import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import WorkStyleForm from "@/components/forms/WorkStyleForm";
import { ShieldCheck } from "lucide-react";

type EditWorkStylePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditWorkStylePage({
  params,
}: EditWorkStylePageProps) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: workStyle } =
    await supabase
      .from("company_work_style")
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

  if (!workStyle) {
    notFound();
  }

  const transformedWorkStyle = {
       ...workStyle,

    company_id:
      workStyle.company_id,

    companyName:
      workStyle.companies?.name || "",

    hqCity:
      workStyle.companies?.hq_city || null,

    companyWebsite:
      workStyle.companies?.website || "",

    roleName:
      workStyle.roles?.name || "",

    workCity:
      workStyle.work_city || null,
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
                Çalışma Biçimi
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>

        <div className="mt-6">

          <WorkStyleForm
            showHeader={false}
            mode="edit"
            initialData={transformedWorkStyle}
          />

        </div>

      </div>

    </main>

  );
}