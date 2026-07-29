import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import InterviewForm from "@/components/forms/InterviewForm";
import { ShieldCheck } from "lucide-react";

type EditInterviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditInterviewPage({
  params,
}: EditInterviewPageProps) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: interview } =
    await supabase
      .from("interview_experiences")
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

  if (!interview) {
    notFound();
  }

  const transformedInterview = {
    ...interview,

    company_id:
      interview.company_id,

    roleName:
      interview.roles?.name || "",

    companyName:
      interview.companies?.name || "",

    hqCity:
      interview.companies?.hq_city || null,

    companyWebsite:
      interview.companies?.website || "",

    workCity:
      interview.work_city || null,
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
                Mülakat Süreci
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>

        <div className="mt-6">

          <InterviewForm
            showHeader={false}
            mode="edit"
            initialData={
              transformedInterview
            }
          />

        </div>

      </div>

    </main>

  );

}