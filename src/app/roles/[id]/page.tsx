import { createClient } from "@/lib/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { turkishCities } from "@/app/constants/turkishCities";

type RolePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    experience?: string;
    city?: string;
    year?: string;
    view?: string;
  }>;
};

export async function generateMetadata({
  params,
}: RolePageProps): Promise<Metadata> {

  const { id } = await params;
  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", parseInt(id, 10))
    .maybeSingle();

  return {
    title: role
      ? `${role.name} Maaşları ve Şirket Karşılaştırması | insiderol`
      : "Pozisyon | insiderol",

    description: role
      ? `${role.name} pozisyonu için şirketlere göre maaş ve değerlendirme karşılaştırması.`
      : undefined,
  };
}

export default async function RolePage({
  params,
  searchParams,
}: RolePageProps) {

  const { id } = await params;
  const roleId = parseInt(id, 10);

  const { experience, city, year, view } = await searchParams;

  const experienceFilter = experience?.trim() || "";
  const cityFilter = city?.trim() || "";
  const yearFilter = year?.trim() || "";
  const breakdownView = view === "city" ? "city" : "company";

  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", roleId)
    .maybeSingle();

  if (!role) {
    notFound();
  }

  let salariesQuery = supabase
    .from("salaries")
    .select(
      "id, salary, experience_years, work_city, company_id, created_at, companies(name, slug, logo_url)"
    )
    .eq("role_id", roleId)
    .eq("moderation_status", "approved")
    .eq("role_status", "approved")
    .eq("company_status", "approved");

  if (experienceFilter === "0-2") {
    salariesQuery = salariesQuery
      .gte("experience_years", 0)
      .lte("experience_years", 2);
  } else if (experienceFilter === "3-5") {
    salariesQuery = salariesQuery
      .gte("experience_years", 3)
      .lte("experience_years", 5);
  } else if (experienceFilter === "5+") {
    salariesQuery = salariesQuery.gte("experience_years", 5);
  }

  if (cityFilter) {
    salariesQuery = salariesQuery.eq("work_city", Number(cityFilter));
  }

  if (yearFilter) {
    const yearNum = Number(yearFilter);

    salariesQuery = salariesQuery
      .gte("created_at", `${yearNum}-01-01T00:00:00.000Z`)
      .lt("created_at", `${yearNum + 1}-01-01T00:00:00.000Z`);
  }

  const { data: salaries } = await salariesQuery;

  const { data: reviews } = await supabase
    .from("company_reviews")
    .select("id, overall_rating, company_id")
    .eq("role_id", roleId)
    .eq("moderation_status", "approved");

  const totalSalaries = salaries?.length || 0;

  const averageSalary =
    totalSalaries > 0
      ? Math.round(
          (salaries || []).reduce(
            (acc, curr) => acc + (Number(curr.salary) || 0),
            0
          ) / totalSalaries
        )
      : 0;

  const totalReviews = reviews?.length || 0;

  const averageRating =
    totalReviews > 0
      ? (
          (reviews || []).reduce(
            (acc, curr) => acc + (Number(curr.overall_rating) || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0";

  // Per-company breakdown — the whole reason this page pivots on role
  // instead of company: seeing the same position's pay/rating side by
  // side across employers.
  const companyStatsById = new Map<
    number,
    {
      name: string;
      slug: string;
      logoUrl: string | null;
      salaryTotal: number;
      salaryCount: number;
      ratingTotal: number;
      reviewCount: number;
    }
  >();

  const getCompanyStats = (
    companyId: number,
    company: {
      name: string;
      slug: string;
      logo_url: string | null;
    } | null
  ) => {
    let stats = companyStatsById.get(companyId);

    if (!stats) {
      stats = {
        name: company?.name || "Bilinmeyen Şirket",
        slug: company?.slug || "",
        logoUrl: company?.logo_url || null,
        salaryTotal: 0,
        salaryCount: 0,
        ratingTotal: 0,
        reviewCount: 0,
      };

      companyStatsById.set(companyId, stats);
    }

    return stats;
  };

  (salaries || []).forEach((salary: any) => {
    if (!salary.company_id) return;

    const stats = getCompanyStats(
      salary.company_id,
      salary.companies
    );

    stats.salaryTotal += Number(salary.salary) || 0;
    stats.salaryCount += 1;
  });

  (reviews || []).forEach((review: any) => {
    if (!review.company_id) return;

    // A review's company row wasn't fetched in the reviews query — only
    // salaries carries the join — so fall back to whatever is already
    // in the map (a company with reviews but zero salaries would still
    // need a name, but we only have its id in that case).
    const stats = getCompanyStats(review.company_id, null);

    stats.ratingTotal += Number(review.overall_rating) || 0;
    stats.reviewCount += 1;
  });

  const companyBreakdown = Array.from(
    companyStatsById.entries()
  )
    .map(([companyId, stats]) => ({
      companyId,
      name: stats.name,
      slug: stats.slug,
      logoUrl: stats.logoUrl,
      salaryCount: stats.salaryCount,
      reviewCount: stats.reviewCount,
      averageSalary:
        stats.salaryCount > 0
          ? Math.round(stats.salaryTotal / stats.salaryCount)
          : 0,
      averageRating:
        stats.reviewCount > 0
          ? stats.ratingTotal / stats.reviewCount
          : 0,
    }))
    .sort((a, b) => b.averageSalary - a.averageSalary);

  // City breakdown — same salary rows, grouped by work_city instead of
  // company. Reviews carry no work_city, so this is salary-only (no
  // rating column here, unlike the company breakdown above).
  const cityStatsById = new Map<
    number,
    { salaryTotal: number; salaryCount: number }
  >();

  (salaries || []).forEach((salary: any) => {
    if (!salary.work_city) return;

    const stats = cityStatsById.get(salary.work_city) || {
      salaryTotal: 0,
      salaryCount: 0,
    };

    stats.salaryTotal += Number(salary.salary) || 0;
    stats.salaryCount += 1;

    cityStatsById.set(salary.work_city, stats);
  });

  const cityBreakdown = Array.from(cityStatsById.entries())
    .map(([cityId, stats]) => ({
      cityId,
      name:
        turkishCities.find((c) => c.id === cityId)?.name ||
        "Bilinmeyen Şehir",
      salaryCount: stats.salaryCount,
      averageSalary:
        stats.salaryCount > 0
          ? Math.round(stats.salaryTotal / stats.salaryCount)
          : 0,
    }))
    .sort((a, b) => b.averageSalary - a.averageSalary);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => currentYear - i
  );

  const hasFilters =
    !!experienceFilter || !!cityFilter || !!yearFilter;

  const buildViewHref = (targetView: "company" | "city") => {
    const searchParams = new URLSearchParams();

    if (experienceFilter) searchParams.set("experience", experienceFilter);
    if (cityFilter) searchParams.set("city", cityFilter);
    if (yearFilter) searchParams.set("year", yearFilter);
    if (targetView !== "company") searchParams.set("view", targetView);

    const qs = searchParams.toString();
    return qs ? `/roles/${roleId}?${qs}` : `/roles/${roleId}`;
  };

  return (
    <main
      style={{ backgroundColor: "var(--background)" }}
      className="h-auto text-[var(--text-dark)] pt-0 px-4 pb-20 relative z-0"
    >
      <div className="w-full max-w-6xl mx-auto px-4">

        <div
          className="
            bg-gradient-to-br
            border border-black/10
            from-white
            via-zinc-50
            to-zinc-100
            rounded-[0.75rem]
            p-3 md:p-5
            mt-6
          "
        >

          <div
            className="
              flex items-center
              justify-center
              text-center
              text-2xl
              text-[var(--text-dark)]
              mb-4
            "
          >
            <span className="font-medium text-[var(--text-dark)]">
              {role.name}
            </span>

            <span className="ml-1.5 text-black/50">
              {" "}Maaş ve Değerlendirmeleri
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <p className="text-[var(--text-dark)] text-[20px] font-semibold tracking-tight leading-none">
                ⭐{averageRating}
              </p>
              <span className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Ortalama Puan
              </span>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {totalSalaries}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Maaş Paylaşımı
              </p>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {averageSalary > 0
                  ? `₺${averageSalary.toLocaleString("tr-TR")}`
                  : "-"}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Ortalama Maaş
              </p>
            </div>

            <div className="card-light card-compact flex flex-col items-center justify-center gap-1">
              <div className="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-dark)]">
                {totalReviews}
              </div>
              <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80 mt-2">
                Değerlendirme
              </p>
            </div>

          </div>
        </div>

        <form
          className="flex flex-wrap items-center gap-2 mt-6"
        >
          <input type="hidden" name="view" value={breakdownView} />

          <select
            name="experience"
            defaultValue={experienceFilter}
            className="form-field !w-auto"
          >
            <option value="">Tüm Deneyimler</option>
            <option value="0-2">0-2 yıl</option>
            <option value="3-5">3-5 yıl</option>
            <option value="5+">5+ yıl</option>
          </select>

          <select
            name="city"
            defaultValue={cityFilter}
            className="form-field !w-auto"
          >
            <option value="">Tüm Şehirler</option>
            {turkishCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="year"
            defaultValue={yearFilter}
            className="form-field !w-auto"
          >
            <option value="">Tüm Yıllar</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button type="submit" className="form-btn">
            Filtrele
          </button>

          {hasFilters && (
            <Link
              href={`/roles/${roleId}`}
              className="form-btn form-btn-secondary"
            >
              Temizle
            </Link>
          )}
        </form>

        {yearFilter && (
          <p className="text-xs text-[var(--muted-dark)] mt-2">
            * Enflasyon etkisi hesaba katılmamıştır — rakamlar
            paylaşıldıkları tarihteki nominal değerlerdir.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-dark)]">
            {breakdownView === "city"
              ? "Şehirlere Göre Karşılaştırma"
              : "Şirketlere Göre Karşılaştırma"}
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href={buildViewHref("company")}
              className={`form-btn ${
                breakdownView === "company" ? "" : "form-btn-secondary"
              }`}
            >
              Şirkete Göre
            </Link>

            <Link
              href={buildViewHref("city")}
              className={`form-btn ${
                breakdownView === "city" ? "" : "form-btn-secondary"
              }`}
            >
              Şehre Göre
            </Link>
          </div>
        </div>

        <div className="mt-3">
          {breakdownView === "city" ? (
            cityBreakdown.length === 0 ? (
              <div className="card-light rounded-[1rem] p-6 text-center text-[var(--muted-dark)]">
                Bu filtrelerle eşleşen şehir bazlı veri yok.
              </div>
            ) : (
              <div className="grid gap-3">
                {cityBreakdown.map((cityStat) => (
                  <div
                    key={cityStat.cityId}
                    className="card-light rounded-[1rem] p-4 md:p-5 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-[var(--text-dark)]">
                        {cityStat.name}
                      </h3>

                      <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                        {cityStat.salaryCount} maaş
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-[var(--text-dark)]">
                        {cityStat.averageSalary > 0
                          ? `₺${cityStat.averageSalary.toLocaleString("tr-TR")}`
                          : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : companyBreakdown.length === 0 ? (
            <div className="card-light rounded-[1rem] p-6 text-center text-[var(--muted-dark)]">
              Bu filtrelerle eşleşen şirket bazlı veri yok.
            </div>
          ) : (
            <div className="grid gap-3">
              {companyBreakdown.map((company) => (
                <Link
                  key={company.companyId}
                  href={
                    company.slug
                      ? `/companies/${company.slug}`
                      : "#"
                  }
                  className="card-light rounded-[1rem] p-4 md:p-5 flex items-center gap-4"
                >
                  <div
                    className="
                      w-12 h-12
                      rounded-md
                      border
                      flex items-center justify-center
                      font-semibold
                      flex-shrink-0
                      bg-white
                      overflow-hidden
                    "
                  >
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      company.name.charAt(0)
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-[var(--text-dark)]">
                      {company.name}
                    </h3>

                    <p className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                      {company.salaryCount} maaş · {company.reviewCount} yorum
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-[var(--text-dark)]">
                      {company.averageSalary > 0
                        ? `₺${company.averageSalary.toLocaleString("tr-TR")}`
                        : "-"}
                    </div>

                    <div className="text-[10px] tracking-[0.14em] text-[var(--muted-dark)]/80">
                      {company.averageRating > 0
                        ? `⭐ ${company.averageRating.toFixed(1)}`
                        : "Puan yok"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
