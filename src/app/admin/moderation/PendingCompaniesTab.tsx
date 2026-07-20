import { createClient } from "@/lib/server";
import { updatePendingCompany, rejectCompany, approveCompany, } from "./actions";

export default async function PendingCompaniesTab({
  status,
}: {
  status: string;
}) {

  const supabase =
    await createClient();

  const { data: companies } =
    await supabase
      .from("pending_companies")
      .select("*")
      .eq("status", status)
      .order("submission_count", {
        ascending: false,
      });

      const userIds =
  companies
    ?.map((c) => c.user_id)
    .filter(Boolean) ?? [];

const { data: profiles } =
  await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

const usernameMap = Object.fromEntries(
  (profiles ?? []).map((p) => [
    p.id,
    p.username,
  ])
);

const { count: pendingCount } = await supabase
  .from("pending_companies")
  .select("*", { count: "exact", head: true })
  .eq("status", "pending");

const { count: approvedCount } = await supabase
  .from("pending_companies")
  .select("*", { count: "exact", head: true })
  .eq("status", "approved");

const { count: rejectedCount } = await supabase
  .from("pending_companies")
  .select("*", { count: "exact", head: true })
  .eq("status", "rejected");

return (
    
<>

    <hr className="border-t-2 border border-green-500 mb-6" />

  <div className="flex justify-center gap-3 mb-6">

    <a
      href="/admin/moderation?tab=companies&status=pending"
      className={
        status === "pending"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
    >
      Bekleyen Şirketler ({pendingCount ?? 0})
    </a>

    <a
      href="/admin/moderation?tab=companies&status=approved"
      className={
        status === "approved"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
    >
      Onaylanan Şirketler ({approvedCount ?? 0})
    </a>

    <a
      href="/admin/moderation?tab=companies&status=rejected"
      className={
        status === "rejected"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
    >
      Reddedilen Şirketler  ({rejectedCount ?? 0})
    </a>

  </div>

<div className="flex flex-wrap justify-center gap-20">

      {companies?.map((company) => (

        <div
          key={company.id}
          className="company-card p-4 w-100  border border-black/20"
        >

        <form
  action={async (formData) => {
    "use server";

    await updatePendingCompany(
      company.id,
      String(
        formData.get("suggested_name")
      )
    );
  }}
>
  <div className="flex flex-col gap-2">

    <input
      type="text"
      name="suggested_name"
      defaultValue={
        company.suggested_name
      }
      className="
        w-full
        rounded-lg
        border
        border-black/70
        bg-white/30
        px-3
        py-2
        text-sm
        text-black
      "
    />

    <button
      type="submit"
      className="form-btn"
    >
      Kaydet
    </button>

  </div>
</form>

          <div className="mt-1 text-sm text-[var(--text-dark)]">
            Öneren:{" "}
            <span className="font-medium text-[var(--text-dark)]">
              @{usernameMap[company.user_id] ?? "Bilinmiyor"}
            </span>
          </div>

          <div className="mt-1 text-sm text-[var(--text-dark)]">
            Kaynak:{" "}
            <span className="font-medium text-[var(--text-dark)]">
              {company.source_type ?? "-"}
            </span>
          </div>

          <div className="mt-1 text-sm text-[var(--text-dark)]">
            Gönderim:{" "}
            <span className="font-medium text-[var(--text-dark)]">
              {company.submission_count ?? 0}
            </span>
          </div>

          <div className="text-xs text-[var(--text-dark)] mt-1">
            {new Date(
              company.created_at
            ).toLocaleString("tr-TR")}
          </div>

          <span
            className="
              inline-flex
              items-center
              rounded-full
              px-2.5
              py-1
              text-xs
              font-medium
              bg-yellow-100
              text-yellow-800
            "
          >
            Beklemede
          </span>

          <div className="mt-3 flex gap-2">

           <form
                action={async () => {
                    "use server";

                    await approveCompany(
                    company.id,
                    company.suggested_name
                    );
                }}
                >
                <button
                    type="submit"
                    className="form-btn"
                >
                    Onayla
                </button>
                </form>

           <form
            action={async () => {
                "use server";

                await rejectCompany(
                company.id
                );
            }}
            >
            <button
                type="submit"
                className="form-btn form-btn-secondary"
            >
                Reddet
            </button>
            </form>

          </div>

        </div>

      ))}

    </div>

  </>
);
}