import { createClient } from "@/lib/server";
import MyPostsClient from "./MyPostsClient";
import { redirect } from "next/navigation";


  export default async function MyPostsPage() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

      if (!user) {
        redirect("/");
      }

  const { data: reviews } = await supabase
    .from("company_reviews")
    .select(`
      *,
      companies(name),
      roles(name)
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

    const { data: salaries } = await supabase
    .from("salaries")
    .select(`
        *,
        companies(name),
        roles(name)
    `)
    .eq("user_id", user.id)
    .order("created_at", {
        ascending: false,
    });

   const { data: workStyles } = await supabase
  .from("company_work_style")
  .select(`
    *,
    companies(name),
    roles(name)
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

  const {
  data: benefits,
  error: benefitsError,
} = await supabase
  .from("company_benefits")
  .select(`
    *,
    companies(name),
    roles(name)
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

const { data: compensations } = await supabase
  .from("company_compensation")
  .select(`
    *,
    companies(name),
    roles(name)
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

  const { data: interviews } = await supabase
  .from("interview_experiences")
  .select(`
    *,
    companies(name),
    roles(name)
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

  return (
    <main className="w-full max-w-6xl mx-auto px-4">

      <MyPostsClient
        reviews={reviews || []}
        salaries={salaries || []}
        workStyles={workStyles || []}
        benefits={benefits ?? []}
        compensations={compensations ?? []}
        interviews={interviews || []}
      />

    </main>
  );
}