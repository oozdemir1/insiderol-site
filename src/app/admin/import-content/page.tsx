import { importRolesCsv, importCompaniesCsv, } from "./actions";
import { INDUSTRIES } from "@/app/constants/industries";

export default async function ImportContentPage({
  searchParams,
}: {
    searchParams: Promise<{
    inserted?: string;
    skipped?: string;
    failed?: string;

    roleInserted?: string;
    roleSkipped?: string;
    roleFailed?: string;
  }>;
}) {

const params = await searchParams;
 

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-purple-600">
          İçerik İçe Aktarma
        </h1>

        <div className="mt-2 text-sm text-[var(--muted-dark)]">
          Roller ve şirketleri toplu olarak sisteme ekleyin.
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div className="company-card p-6">
          <h2 className="text-xl font-semibold mb-4">
            Rol İçe Aktarma
          </h2>

          <p className="text-md text-[var(--muted-dark)] mb-4">
            CSV dosyasından roller ekleyin.
          </p>

          <form action={importRolesCsv}>

            <a
              href="/templates/roles-template.csv"
              download
              className="text-sm text-purple-600 hover:underline"
            >
              Örnek CSV İndir
            </a>

            <input
                type="file"
                name="file"
                accept=".csv"
                className="form-field"
            />

            <button
                className="form-btn mt-4"
                type="submit"
            >
                Rolleri İçe Aktar
            </button>
                {params.roleInserted && (
                  <div className="mt-4 rounded bg-green-50 p-3 text-sm text-[red]">
                    <div>
                      Eklenen: {params.roleInserted}
                    </div>

                    <div>
                      Atlanan: {params.roleSkipped}
                    </div>

                    <div>
                      Hatalı: {params.roleFailed}
                    </div>
                  </div>
                )}
            </form>
        </div>

        <div className="company-card p-6">
          <h2 className="text-xl font-semibold mb-4">
            Şirket İçe Aktarma
          </h2>

          <p className="text-md text-[var(--muted-dark)] mb-4">
            CSV dosyasından şirket ekleyin.
          </p>

         <form action={importCompaniesCsv}>

          <div className="mb-4 text-sm text-[var(--muted-dark)]">
            Beklenen CSV sütunları:
            <br />
            name,website,industry,hq_city,logo_url
          </div>
            <div className="mt-2 rounded bg-gray-50 text-xs text-[var(--muted-dark)]">
              Örnek:
              <br />
              Trendyol,https://trendyol.com,E-Ticaret,İstanbul,/logos/trendyol.png
            </div>

            <div className="mt-4 text-sm text-[var(--muted-dark)]">
              <div className="font-medium mb-2">
                Geçerli Sektörler
              </div>

              <div className="text-[var(--muted-dark)]">
                {INDUSTRIES.map(
                  (industry) => industry.name
                ).join(" | ")}
              </div>
            </div>

            <div className="mt-4 text-sm text-[var(--muted-dark)]">
              <div className="font-medium mb-2">
                Şehir Formatı
              </div>

              <div className="text-[var(--muted-dark)]">
                CSV'de şehir adı kullanılmalıdır.
                <br />
                Örn: İstanbul | Ankara | İzmir |
                Bursa | Kocaeli | Sakarya |
                Antalya
              </div>
            </div>
              <a
                href="/templates/companies-template.csv"
                download
                className="mt-4 inline-block  text-sm text-purple-600 hover:underline"
              >
                Örnek CSV İndir
              </a>

            <input
              type="file"
              name="file"
              accept=".csv"
              className="form-field"
            />

            <button
              className="form-btn mt-4"
              type="submit"
            >
              Şirketleri İçe Aktar
            </button>
                {params.inserted && (
                  <div className="mt-4 rounded bg-green-50 p-3 text-sm text-[red]">
                    <div>
                      Eklenen: {params.inserted}
                    </div>

                    <div>
                      Atlanan: {params.skipped}
                    </div>

                    <div>
                      Hatalı: {params.failed}
                    </div>
                  </div>
                )}
          </form>
        </div>

      </div>
    </div>
  );
}