import { notFound } from "next/navigation";
import { createClient } from "@/lib/server";
import ReviewFormSteps from "@/components/forms/ReviewFormSteps";
import { ShieldCheck } from "lucide-react";

type EditReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditReviewPage({
  params,
}: EditReviewPageProps) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: review } =
    await supabase
      .from("company_reviews")
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

  if (!review) {
    notFound();
  }

  const transformedReview = {
  ...review,

  companyId:
    review.company_id,

  companyName:
    review.companies?.name || "",

  hqCity:
    review.companies?.hq_city || null,

  companyWebsite:
    review.companies?.website || "",

  workCity:
    review.work_city || null,
};

  return (

    <main className="w-full py-5 pb-16">

      <div className="max-w-6xl mx-auto px-4 ">

       
        
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
                Yorum
              </span>
          <span className="text-black/50">Paylaşımını Düzenle</span>
              
            </div>


       <div className="mt-6">

  <ReviewFormSteps
    showHeader={false}
    mode="edit"
    initialData={transformedReview}
  />

</div>

      </div>

    </main>

  );
}