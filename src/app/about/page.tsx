import { createClient } from "@/lib/server";
import { Target, Ghost, ShieldCheck, Building2 } from "lucide-react";
import CommunityCTA from "@/components/sections/CommunityCTA";

export default async function AboutPage() {
  const supabase = await createClient();

  const [{ count: companyCount }, { count: roleCount }] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("roles").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-[var(--surface)] py-24 px-8 text-center">
        <div className="max-w-4xl mx-auto">

          <p className="text-sm font-semibold tracking-wide uppercase text-[var(--accent)] mb-4">
            Hakkımızda
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Kimliğini paylaşmadan, gerçeği paylaş.
          </h1>

          <p className="text-[var(--muted)] text-lg leading-8 mt-6 max-w-2xl mx-auto">
            insiderol, çalışanların maaşlarını, şirket deneyimlerini ve mülakat
            süreçlerini kimliklerini açık etmeden paylaşabildiği bir platform.
          </p>
        </div>
      </section>

      {/* Purpose */}
      <section className="bg-[var(--section-light)] py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
            <Target size={22} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-dark)]">
            Amacımız
          </h2>

          <p className="text-[var(--muted-dark)] text-lg leading-8 mt-5">
            İş arayanların ve çalışanların gerçek verilerle daha bilinçli
            kararlar almasını sağlamak istiyoruz. Maaş pazarlığı yaparken, bir
            teklifi değerlendirirken ya da yeni bir şirkete geçmeden önce,
            insanların birbirinin deneyiminden faydalanabileceği güvenilir bir
            kaynak olmayı hedefliyoruz.
          </p>
        </div>
      </section>

      {/* Anonymity */}
      <section className="bg-[var(--section-light-2)] py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
            <Ghost size={22} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-dark)]">
            Anonimliğin nasıl korunuyor?
          </h2>

          <p className="text-[var(--muted-dark)] text-lg leading-8 mt-5">
            Her paylaşımda kullanıcı adını açık etmek ya da anonim kalmak sana ait
            bir seçim. Ama bundan daha önemlisi: platformda, birinin yaptığı
            tüm paylaşımları tek bir sayfada toplayan bir &ldquo;profil&rdquo;
            sistemi bilinçli olarak kurmadık.
          </p>

          <div className="mt-6 rounded-2xl border-l-2 border-[var(--accent)] bg-[var(--card-light)] p-6">
            <p className="text-[var(--text-dark)] leading-7">
              Böyle bir sistem, tek tek anonim kalan paylaşımları bir araya
              getirerek kimliğin çözülebilir hale gelmesine yol açabilir. Bu
              riski almamayı bilinçli olarak tercih ettik.
            </p>
          </div>
        </div>
      </section>

      {/* Moderation */}
      <section className="bg-[var(--section-light)] py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
            <ShieldCheck size={22} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-dark)]">
            İçerik nasıl denetleniyor?
          </h2>

          <p className="text-[var(--muted-dark)] text-lg leading-8 mt-5">
            Paylaşılan her maaş, yorum ve mülakat deneyimi, yayınlanmadan önce
            bir moderasyon sürecinden geçer. Bu süreç hem kötüye kullanımı hem
            de gerçek dışı içerikleri engellemeyi amaçlar.
          </p>
        </div>
      </section>

      {/* Stage / honesty */}
      <section className="bg-[var(--section-light-2)] py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
            <Building2 size={22} />
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-4 mb-6">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[var(--text-dark)]">
                {companyCount || 0}+
              </div>
              <p className="text-[var(--muted-dark)] mt-1">şirket profili</p>
            </div>

            <div>
              <div className="text-4xl md:text-5xl font-bold text-[var(--text-dark)]">
                {roleCount || 0}+
              </div>
              <p className="text-[var(--muted-dark)] mt-1">pozisyon</p>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-dark)]">
            Büyümeye devam eden bir topluluk
          </h2>

          <p className="text-[var(--muted-dark)] text-lg leading-8 mt-5">
            Aradığın şirket ya da pozisyon listede yoksa, eklenmesi için
            önerebilirsin — moderasyon ekibimiz inceleyip onayladıktan sonra
            profili yayına alınır. Sahte istatistiklerle büyük görünmek
            yerine gerçek verilerle büyümeyi tercih ediyoruz: ilk maaşı ya da
            yorumu paylaşan sen olabilirsin.
          </p>
        </div>
      </section>

      <CommunityCTA sectionBg="light" />
    </main>
  );
}
