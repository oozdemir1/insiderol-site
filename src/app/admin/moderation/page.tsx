import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import PendingRolesTab from "./PendingRolesTab";
import PendingCompaniesTab from "./PendingCompaniesTab";
import PendingContentTab from "./PendingContentTab";
import ContactMessagesTab from "./ContactMessagesTab";

export default async function ModerationPage({
  searchParams,
}: {
searchParams: Promise<{
  tab?: string;
  status?: string;
}>;
}) {
  // Gated once here, for all four tabs — PendingRolesTab already did its
  // own check, but the other three (and this page's own shell) had none,
  // so any signed-in (or signed-out, since middleware doesn't touch
  // /admin) visitor who knew the URL could reach them.
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

 const params = await searchParams;

const tab =
  params.tab || "roles";

const status =
  params.status ||
  (tab === "messages" ? "unread" : "pending");

 const pageTitle =
  tab === "roles"
    ? "Moderation • Roller"
    : tab === "companies"
    ? "Moderation • Şirketler"
    : tab === "messages"
    ? "Moderation • Mesajlar"
    : "Moderation • İçerikler";

const titleColor =
  tab === "roles"
    ? "text-blue-600"
    : tab === "companies"
    ? "text-green-600"
    : tab === "messages"
    ? "text-orange-600"
    : "text-purple-600";

  return (
    <div className="p-6">
   <h1
    className={`
        text-3xl
        font-bold
        text-center
        mb-8
        ${titleColor}
    `}
    >
  {pageTitle}
</h1>

    <div className="flex justify-center gap-3 mb-8">

  <a
    href="/admin/moderation?tab=roles"
    className={
      tab === "roles"
        ? "form-btn"
        : "form-btn form-btn-secondary"
    }
  >
    Roller
  </a>

  <a
    href="/admin/moderation?tab=companies"
    className={
      tab === "companies"
        ? "form-btn"
        : "form-btn form-btn-secondary"
    }
  >
    Şirketler
  </a>

  <a
  href="/admin/moderation?tab=content"
  className={
    tab === "content"
      ? "form-btn"
      : "form-btn form-btn-secondary"
  }
>
  İçerikler
</a>

  <a
  href="/admin/moderation?tab=messages"
  className={
    tab === "messages"
      ? "form-btn"
      : "form-btn form-btn-secondary"
  }
>
  Mesajlar
</a>

</div>

      {tab === "roles" && (
       <PendingRolesTab
        status={status}
        />
      )}

      {tab === "companies" && (
        <PendingCompaniesTab
            status={status}
        />
        )}

        {tab === "content" && (
        <PendingContentTab
            status={status}
        />
        )}

        {tab === "messages" && <ContactMessagesTab status={status} />}

    </div>
  
  );
}