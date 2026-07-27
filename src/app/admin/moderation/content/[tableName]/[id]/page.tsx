import { createClient } from "@/lib/server";
import { redirect, notFound } from "next/navigation";
import { saveContentEdits } from "../../../actions";
import { MODERATED_TABLES } from "../../../moderatedTables";


export default async function EditContentPage({
  params,
}: {
  params: Promise<{
    tableName: string;
    id: string;
  }>;
}) {
  const { tableName, id } = await params;

  if (!MODERATED_TABLES.includes(tableName)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const hasTitle =
  tableName === "company_reviews" ||
  tableName === "interview_experiences";

  const { data: content } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", Number(id))
    .single();

  const title = content?.title ?? "";
  const review =
    tableName === "interview_experiences"
      ? content?.experience ?? ""
      : tableName === "salaries"
      ? content?.comment ?? ""
      : tableName === "company_benefits"
      ? content?.comment ?? ""
      : tableName === "company_compensation"
      ? content?.comment ?? ""
      : tableName === "company_work_style"
      ? content?.comment ?? ""
      : content?.review ?? "";

      const contentTypeLabel =
  tableName === "company_reviews"
    ? "Şirket Yorumu"
    : tableName === "interview_experiences"
    ? "Mülakat Süreci"
    : tableName === "salaries"
    ? "Maaş"
    : tableName === "company_benefits"
    ? "Yan Hak"
    : tableName === "company_compensation"
    ? "Ücret Politikası"
    : tableName === "company_work_style"
    ? "Çalışma Biçimi"
    : tableName;

  const { data: company } = await supabase
  .from("companies")
  .select("name")
  .eq("id", content?.company_id)
  .single();

const { data: role } = await supabase
  .from("roles")
  .select("name")
  .eq("id", content?.role_id)
  .single();


  return (
   <div className="max-w-6xl mx-auto p-6">
   <div className="p-6">
      <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-purple-600">
        İçerik Düzenleme
      </h1>
<div className="mt-2 text-md font-medium text-purple-600">
  İçerik Türü (Form): {contentTypeLabel}
</div>

<div className="mt-2 text-sm text-[var(--muted-dark)]">
  Şirket: {company?.name ?? "-"}
</div>

<div className="text-sm text-[var(--muted-dark)]">
  Rol: {role?.name ?? "-"}
</div>

<div className="text-sm text-[var(--muted-dark)]">
  ID: {id}
</div>
    </div>

    <form
      action={saveContentEdits}
      className="company-card p-6"
    >

     <div className="mt-6 space-y-4">

 <div>
  <label className="form-label block mb-2">
    Başlık
  </label>

  {hasTitle ? (
    <input
      name="title"
      type="text"
      defaultValue={title}
      className="form-field"
    />
  ) : (
    <div className="text-sm text-[var(--muted-dark)] italic">
      Bu içerik türünde başlık alanı bulunmamaktadır.
    </div>
  )}
</div>

  <div>
    <label className="form-label block mb-2">
      Yorum
    </label>

<textarea
  name="review"
  defaultValue={review}
  className="form-field"
  style={{ height: "500px" }}
/>
  </div>

</div>

<div className="mt-6 flex justify-center gap-3">

    <a
      href="/admin/moderation?tab=content"
      className="form-btn form-btn-secondary"
    >
      Geri
    </a>

  <button
    type="submit"
    className="form-btn"
  >
    Kaydet
  </button>

 

</div>

<input
  type="hidden"
  name="tableName"
  value={tableName}
/>

<input
  type="hidden"
  name="id"
  value={id}
/>

</form>
    </div>
    </div>
  );
}