import PendingRolesTab from "./PendingRolesTab";
import PendingCompaniesTab from "./PendingCompaniesTab";
import PendingContentTab from "./PendingContentTab";

export default async function ModerationPage({
  searchParams,
}: {
searchParams: Promise<{
  tab?: string;
  status?: string;
}>;
}) {

 const params = await searchParams;

const tab =
  params.tab || "roles";

const status =
  params.status || "pending";

 const pageTitle =
  tab === "roles"
    ? "Moderation • Roller"
    : tab === "companies"
    ? "Moderation • Şirketler"
    : "Moderation • İçerikler";

const titleColor =
  tab === "roles"
    ? "text-blue-600"
    : tab === "companies"
    ? "text-green-600"
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

    </div>
  
  );
}