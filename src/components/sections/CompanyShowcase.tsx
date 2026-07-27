import Link from "next/link";

type ShowcaseCompany = {
  name: string;
  slug: string;
  logo_url: string | null;
};

export default function CompanyShowcase({
  companies,
  totalCount,
}: {
  companies: ShowcaseCompany[];
  totalCount: number;
}) {
  if (companies.length === 0) return null;

  return (
    <section className="py-28 px-8 bg-[var(--section-light)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
            {totalCount}+ şirket profili
          </h2>
          <p className="text-[var(--muted-dark)] text-lg mt-4">
            Aradığın şirketi bul, sayfasını incele, ilk deneyimi sen paylaş.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border border-black/[0.06] bg-[var(--card-light)] shadow-[0_1px_2px_rgba(16,24,40,0.03),0_8px_20px_rgba(16,24,40,0.05)] hover:bg-white transition-colors text-sm font-medium text-[var(--text-dark)]"
            >
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center overflow-hidden shrink-0 ${
                  company.logo_url
                    ? "bg-white border border-black/5 p-1"
                    : "bg-[var(--card-green)] text-white"
                }`}
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  company.name.charAt(0).toUpperCase()
                )}
              </span>
              {company.name}
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-11">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 bg-[var(--text-dark)] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Şirket Ara
          </Link>
        </div>
      </div>
    </section>
  );
}
