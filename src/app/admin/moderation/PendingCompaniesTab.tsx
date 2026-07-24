import { createClient } from "@/lib/server";
import { rejectCompany, approveCompany, updateCompany, } from "./actions";
import { turkishCities } from "@/app/constants/turkishCities";
import { INDUSTRIES } from "@/app/constants/industries";

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
      .select("*, companies(*)")
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

const cityName = (id: number | null) =>
  turkishCities.find((city) => city.id === id)?.name ?? "-";

const industryName = (id: number | null) =>
  INDUSTRIES.find((industry) => industry.id === id)?.name ?? "-";

const statusBadge: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Beklemede",
    className: "bg-yellow-100 text-yellow-800",
  },
  approved: {
    label: "Onaylandı",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Reddedildi",
    className: "bg-red-100 text-red-800",
  },
};

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
          className={`
            inline-flex
            items-center
            rounded-full
            px-2.5
            py-1
            text-xs
            font-medium
            mt-1
            ${statusBadge[status]?.className ?? statusBadge.pending.className}
          `}
        >
          {statusBadge[status]?.label ?? statusBadge.pending.label}
        </span>

        {status === "pending" && (
          <>
          {/* Tek form: isim/website/şehir kullanıcı önerisiyle önden dolu
              geliyor, hepsi düzenlenebilir; sektör ve logo admin tarafından
              burada eklenir. Tek "Onayla" submit'i hem düzenlemeleri hem
              onayı aynı adımda uygular — ayrı bir "Kaydet" adımına gerek yok. */}
          <form
            action={async (formData) => {
              "use server";

              const rawHqCity = formData.get("hq_city");
              const rawIndustry = formData.get("industry");
              const rawWebsite = String(formData.get("website") ?? "").trim();
              const rawLogoUrl = String(formData.get("logo_url") ?? "").trim();

              await approveCompany(
                company.id,
                String(
                  formData.get("name") ?? company.suggested_name
                ),
                {
                  website: rawWebsite || null,
                  hqCity: rawHqCity ? Number(rawHqCity) : null,
                  industry: rawIndustry ? Number(rawIndustry) : null,
                  logoUrl: rawLogoUrl || null,
                }
              );
            }}
          >
            <div className="flex flex-col gap-2 mt-3">

              <label className="text-xs text-[var(--muted-dark)]">Şirket Adı</label>
              <input
                type="text"
                name="name"
                defaultValue={company.suggested_name}
                className="form-field"
              />

              <label className="text-xs text-[var(--muted-dark)]">Website</label>
              <input
                type="text"
                name="website"
                placeholder="https://..."
                defaultValue={company.website ?? ""}
                className="form-field"
              />

              <label className="text-xs text-[var(--muted-dark)]">Merkez Şehir</label>
              <select
                name="hq_city"
                defaultValue={company.hq_city ?? ""}
                className="form-field"
              >
                <option value="">Şehir seçilmedi</option>
                {turkishCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>

              <label className="text-xs text-[var(--muted-dark)]">Sektör</label>
              <select
                name="industry"
                defaultValue=""
                className="form-field"
              >
                <option value="">Sektör seçilmedi</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>

              <label className="text-xs text-[var(--muted-dark)]">Logo URL</label>
              <input
                type="text"
                name="logo_url"
                placeholder="https://.../logo.png"
                className="form-field"
              />

            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="form-btn"
              >
                Onayla
              </button>
            </div>
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
              className="form-btn form-btn-secondary mt-2"
            >
              Reddet
            </button>
          </form>
          </>
        )}

        {status === "approved" && (() => {
          const approved = company.companies;

          if (!approved) {
            return (
              <p className="text-sm text-[var(--muted-dark)] mt-3">
                Onaylanmış şirket kaydı bulunamadı.
              </p>
            );
          }

          return (
            <div className="flex flex-col gap-1 mt-3 text-sm text-[var(--text-dark)]">
              <div>
                <span className="text-[var(--muted-dark)]">Şirket:</span>{" "}
                <a
                  href={`/companies/${approved.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {approved.name}
                </a>
              </div>

              <div>
                <span className="text-[var(--muted-dark)]">Website:</span>{" "}
                {approved.website || "-"}
              </div>

              <div>
                <span className="text-[var(--muted-dark)]">Merkez Şehir:</span>{" "}
                {cityName(approved.hq_city)}
              </div>

              <div>
                <span className="text-[var(--muted-dark)]">Sektör:</span>{" "}
                {industryName(approved.industry)}
              </div>

              <div>
                <span className="text-[var(--muted-dark)]">Logo URL:</span>{" "}
                {approved.logo_url || "-"}
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-[var(--accent)]">
                  Düzenle
                </summary>

                <form
                  action={async (formData) => {
                    "use server";

                    const rawHqCity = formData.get("hq_city");
                    const rawIndustry = formData.get("industry");
                    const rawWebsite = String(formData.get("website") ?? "").trim();
                    const rawLogoUrl = String(formData.get("logo_url") ?? "").trim();
                    const rawName = String(formData.get("name") ?? "").trim();

                    await updateCompany(approved.id, {
                      name: rawName || approved.name,
                      website: rawWebsite || null,
                      hqCity: rawHqCity ? Number(rawHqCity) : null,
                      industry: rawIndustry ? Number(rawIndustry) : null,
                      logoUrl: rawLogoUrl || null,
                    });
                  }}
                >
                  <div className="flex flex-col gap-2 mt-3">

                    <label className="text-xs text-[var(--muted-dark)]">Şirket Adı</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={approved.name}
                      className="form-field"
                    />

                    <label className="text-xs text-[var(--muted-dark)]">Website</label>
                    <input
                      type="text"
                      name="website"
                      placeholder="https://..."
                      defaultValue={approved.website ?? ""}
                      className="form-field"
                    />

                    <label className="text-xs text-[var(--muted-dark)]">Merkez Şehir</label>
                    <select
                      name="hq_city"
                      defaultValue={approved.hq_city ?? ""}
                      className="form-field"
                    >
                      <option value="">Şehir seçilmedi</option>
                      {turkishCities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>

                    <label className="text-xs text-[var(--muted-dark)]">Sektör</label>
                    <select
                      name="industry"
                      defaultValue={approved.industry ?? ""}
                      className="form-field"
                    >
                      <option value="">Sektör seçilmedi</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>

                    <label className="text-xs text-[var(--muted-dark)]">Logo URL</label>
                    <input
                      type="text"
                      name="logo_url"
                      placeholder="https://.../logo.png"
                      defaultValue={approved.logo_url ?? ""}
                      className="form-field"
                    />

                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      className="form-btn"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              </details>
            </div>
          );
        })()}

        {status === "rejected" && (
          <div className="flex flex-col gap-1 mt-3 text-sm text-[var(--text-dark)]">
            <div>
              <span className="text-[var(--muted-dark)]">Önerilen İsim:</span>{" "}
              {company.suggested_name}
            </div>

            <div>
              <span className="text-[var(--muted-dark)]">Website:</span>{" "}
              {company.website || "-"}
            </div>

            <div>
              <span className="text-[var(--muted-dark)]">Merkez Şehir:</span>{" "}
              {cityName(company.hq_city)}
            </div>
          </div>
        )}

        </div>

      ))}

    </div>

  </>
);
}