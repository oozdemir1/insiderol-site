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

  // Every row here already belongs to this account, so a single profile
  // lookup (rather than the /explore-style batch-by-user_id) covers all of
  // it — attached only where the post itself wasn't submitted anonymously.
  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const withAuthor = (rows: any[]) =>
    rows.map((row) =>
      row.is_anonymous
        ? row
        : {
            ...row,
            authorUsername: ownProfile?.username ?? null,
            authorAvatarUrl: ownProfile?.avatar_url ?? null,
          }
    );

  const reviewsWithAuthor = withAuthor(reviews || []);

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

  const salariesWithAuthor = withAuthor(salaries || []);

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
        reviews={reviewsWithAuthor}
        salaries={salariesWithAuthor}
        workStyles={workStyles || []}
        benefits={benefits ?? []}
        compensations={compensations ?? []}
        interviews={interviews || []}
      />

    </main>
  );
}