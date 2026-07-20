import { createClient } from "@/lib/server";
import { approveRole, rejectRole, updatePendingRole } from "./actions";
import { redirect } from "next/navigation";

export default async function PendingRolesTab({
  status,
}: {
  status: string;
}) {
  
  const supabase = await createClient();

  

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/");
}

const { data: profile } =
  await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

if (!profile?.is_admin) {
  redirect("/");
}


  const { data: roles } = await supabase
    .from("pending_roles")
    .select("*")
    .eq("status", status);

  const userIds =
  roles
    ?.map((r) => r.user_id)
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

const titleMap = {
  pending: "Bekleyen Roller",
  approved: "Onaylanan Roller",
  rejected: "Reddedilen Roller",
};

const { count: pendingCount } = await supabase
  .from("pending_roles")
  .select("*", { count: "exact", head: true })
  .eq("status", "pending");

const { count: approvedCount } = await supabase
  .from("pending_roles")
  .select("*", { count: "exact", head: true })
  .eq("status", "approved");

const { count: rejectedCount } = await supabase
  .from("pending_roles")
  .select("*", { count: "exact", head: true })
  .eq("status", "rejected");


  

  return (
<>
      <hr className="border-t-2 border border-blue-500 mb-6" />

  <div className="flex justify-center gap-3 mb-6">
  <a
      href="/admin/moderation?tab=roles&status=pending"
      className={
        status === "pending"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
    >
      Bekleyen Roller ({pendingCount ?? 0})
    </a>

  <a
    href="/admin/moderation?tab=roles&status=approved"
    className={
        status === "approved"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
  >
    Onaylanan Roller ({approvedCount ?? 0})
  </a>

  <a
    href="/admin/moderation?tab=roles&status=rejected"
    className={
        status === "rejected"
          ? "form-btn"
          : "form-btn form-btn-secondary"
      }
  >
    Reddedilen Roller ({rejectedCount ?? 0})
  </a>
</div>

  <div className="flex flex-wrap justify-center gap-20">
    {roles?.map((role) => (
      <div
        key={role.id}
       className="company-card p-4 w-100  border border-black/20"
      >
      <form
          action={async (formData) => {
            "use server";

            await updatePendingRole(
              role.id,
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
                defaultValue={role.suggested_name}
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
            @{usernameMap[role.user_id] ?? "Bilinmiyor"}
          </span>
        </div>

        <div className="mt-1 text-sm text-[var(--text-dark)]">
          Kaynak:{" "}
          <span className="font-medium text-[var(--text-dark)]">
            {role.source_type ?? "-"}
          </span>
        </div>

        <div className="mt-1 text-sm text-[var(--text-dark)]">
          Gönderim:{" "}
          <span className="font-medium text-[var(--text-dark)]">
            {role.submission_count ?? 0}
          </span>
        </div>

        <div className="text-xs text-[var(--text-dark)] mt-1">
          {new Date(role.created_at).toLocaleString("tr-TR")}
        </div>

      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
          ${
            role.status === "approved"
              ? "bg-green-100 text-green-800"
              : role.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }
        `}
      >
        {role.status === "approved"
          ? "Onaylandı"
          : role.status === "rejected"
          ? "Reddedildi"
          : "Beklemede"}
      </span>

    {role.status === "pending" && (
  <div className="mt-3 flex gap-2">
    <form
      action={async () => {
        "use server";

        await approveRole(
          role.id,
          role.suggested_name
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

        await rejectRole(role.id);
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
)}
    </div>
        ))}
      </div>
    </>
  );
}