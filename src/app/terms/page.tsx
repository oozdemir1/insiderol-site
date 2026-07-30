import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="bg-[var(--background)]">
      <section className="bg-[var(--surface)] py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-wide uppercase text-[var(--accent)] mb-4">
            YASAL
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Kullanım Şartları
          </h1>

          <p className="text-[var(--muted)] text-lg leading-8 mt-6 max-w-2xl mx-auto">
            insiderol&apos;u kullanmadan önce, platformun işleyişini ve
            karşılıklı sorumlulukları düzenleyen aşağıdaki şartları dikkatle
            okumanızı rica ediyoruz.
          </p>
        </div>
      </section>

      <section className="py-20 px-8">
        <article className="max-w-3xl mx-auto space-y-10 text-[var(--muted-dark)] leading-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              1. Taraflar ve Kabul
            </h2>
            <p>
              insiderol&apos;a üye olarak veya Platform&apos;u kullanarak bu
              Kullanım Şartları&apos;nı kabul etmiş sayılırsınız.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              2. Hizmetin Tanımı
            </h2>
            <p>
              insiderol, kullanıcıların maaş bilgisi, şirket yorumu, mülakat
              deneyimi ve çalışma koşullarına dair paylaşımlarda bulunduğu
              bir bilgi paylaşım platformudur. Platform&apos;da yer alan
              bilgiler kullanıcı beyanlarına dayanır; resmi istatistik veya
              doğrulanmış veri niteliği taşımaz.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              3. Üyelik ve Hesap Kuralları
            </h2>
            <p>
              Üyelik için geçerli bir e-posta adresi gereklidir. Her
              kullanıcı yalnızca bir hesap açabilir. Hesap güvenliğinizden
              (şifrenizin gizliliği dahil) siz sorumlusunuz.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              4. Kullanıcı İçeriği ve Sorumluluk
            </h2>
            <p>
              Paylaştığınız maaş, yorum ve deneyim bilgilerinin
              doğruluğundan siz sorumlusunuz. insiderol, kullanıcı
              beyanlarının doğruluğunu garanti etmez ve içerik nedeniyle
              üçüncü kişilere karşı sorumluluk kabul etmez.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              5. Anonimlik Kapsamı
            </h2>
            <p>
              &ldquo;Anonim paylaş&rdquo; seçeneği yalnızca kullanıcı
              adınızın herkese açık şekilde gösterilmemesini sağlar; veri
              işleme açısından kapsam için{" "}
              <Link
                href="/privacy"
                className="text-[var(--accent)] hover:underline"
              >
                Gizlilik Politikası
              </Link>{" "}
              Madde 8&apos;e bakınız.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              6. Yasaklı Davranışlar
            </h2>
            <p>
              Sahte bilgi paylaşmak, bir şirket adına kendi lehine yorum
              yazmak, başka kullanıcılara hakaret etmek, spam veya otomatik
              araçlarla içerik göndermek yasaktır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              7. Moderasyon ve İçerik Kaldırma
            </h2>
            <p>
              insiderol, kurallara aykırı bulduğu içerikleri inceleme,
              reddetme veya kaldırma; gerektiğinde hesapları askıya alma
              hakkını saklı tutar.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              8. Fikri Mülkiyet
            </h2>
            <p>
              Platform&apos;un tasarımı, markası ve yazılımı insiderol&apos;a
              aittir. Kullanıcı içerikleri, Platform&apos;da yayınlanmak
              üzere insiderol&apos;a kullanım hakkı tanınmış sayılır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              9. Sorumluluğun Sınırlandırılması
            </h2>
            <p>
              Platform&apos;daki maaş ve yorum bilgileri, kariyer veya
              yatırım kararları için tek başına resmi/güvenilir kaynak
              olarak kullanılmamalıdır. insiderol, bu bilgilere dayanılarak
              alınan kararlardan sorumlu tutulamaz.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              10. Hesap Sonlandırma
            </h2>
            <p>
              Hesabınızı istediğiniz zaman silebilirsiniz. Hesap
              silindiğinde profil bilgileriniz kaldırılır; paylaşımlarınız
              kullanıcı bağlantısı olmadan Platform&apos;da kalmaya devam
              edebilir.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              11. Değişiklikler ve Yürürlük
            </h2>
            <p>
              Bu şartlar güncellenebilir; güncel sürüm bu sayfada
              yayınlanır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              12. Uygulanacak Hukuk
            </h2>
            <p>
              Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir;
              uyuşmazlıklarda Türkiye mahkemeleri yetkilidir.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              13. İletişim
            </h2>
            <p>
              Sorularınız için{" "}
              <Link
                href="/support"
                className="text-[var(--accent)] hover:underline"
              >
                destek sayfamız
              </Link>{" "}
              üzerinden bize ulaşabilirsiniz.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
