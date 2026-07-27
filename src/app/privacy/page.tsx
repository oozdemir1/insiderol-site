import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-[var(--background)]">
      <section className="bg-[var(--surface)] py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-wide uppercase text-[var(--accent)] mb-4">
            GİZLİLİK
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Gizlilik Politikası
          </h1>

          <p className="text-[var(--muted)] text-lg leading-8 mt-6 max-w-2xl mx-auto">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
            uyarınca kişisel verilerinizin nasıl işlendiğine dair aydınlatma
            metni.
          </p>
        </div>
      </section>

      <section className="py-20 px-8">
        <article className="max-w-3xl mx-auto space-y-10 text-[var(--muted-dark)] leading-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              1. Veri Sorumlusu
            </h2>
            <p>
              Bu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması
              Kanunu (&ldquo;KVKK&rdquo;) uyarınca, insiderol platformunu
              (&ldquo;Platform&rdquo;, &ldquo;insiderol&rdquo;, &ldquo;biz&rdquo;)
              işleten insiderol (&ldquo;Veri Sorumlusu&rdquo;) tarafından,
              Platform üzerinden işlenen kişisel verileriniz hakkında sizi
              bilgilendirmek amacıyla hazırlanmıştır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              2. Toplanan Kişisel Veriler
            </h2>
            <p className="mb-4">
              <strong className="text-[var(--text-dark)]">Hesap Verileri:</strong>{" "}
              Üye olurken e-posta adresiniz, kullanıcı adınız ve şifreniz
              (şifrelenmiş/hash&apos;lenmiş olarak) alınır. Google ile giriş
              yaptığınızda Google hesabınızdan e-posta bilginiz alınır.
              Profilinizde, tarafımızca sunulan hazır görsellerden seçtiğiniz
              bir avatar bulunur — fotoğraf yükleme özelliği yoktur.
              Paylaşımlarınızın varsayılan olarak anonim gösterilip
              gösterilmeyeceğine dair tercihiniz de hesabınızla birlikte
              saklanır.
            </p>
            <p className="mb-4">
              <strong className="text-[var(--text-dark)]">İletişim Formu Verileri:</strong>{" "}
              Bize ulaştığınızda adınız (isteğe bağlı), e-posta adresiniz,
              mesaj konunuz ve mesaj içeriğiniz alınır. Kötüye kullanımı
              (spam, aşırı gönderim) önlemek amacıyla mesajınızla birlikte IP
              adresiniz de kaydedilir.
            </p>
            <p className="mb-4">
              <strong className="text-[var(--text-dark)]">İçerik Verileri:</strong>{" "}
              Maaş bilgisi, şirket yorumu, mülakat deneyimi, yan hak/çalışma
              düzeni gibi paylaşımlarınızda girdiğiniz tüm bilgiler
              (çalıştığınız şehir, deneyim yılı, serbest metin yorumlarınız
              dahil) hesabınızla ilişkilendirilerek saklanır.
            </p>
            <p>
              <strong className="text-[var(--text-dark)]">Teknik Veriler:</strong>{" "}
              Oturum açık tutma amacıyla Supabase altyapısı tarafından
              yönetilen kimlik doğrulama çerezleri kullanılır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              3. Kişisel Verilerin İşlenme Amaçları
            </h2>
            <p>
              Kişisel verileriniz; üyelik işlemlerinin yürütülmesi,
              kimliğinizin doğrulanması, iletişim taleplerinizin
              yanıtlanması, Platform&apos;un kötüye kullanımının (sahte hesap,
              spam, kötü niyetli gönderim) önlenmesi ve yasal
              yükümlülüklerimizin yerine getirilmesi amaçlarıyla işlenir.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              4. Hukuki Sebep
            </h2>
            <p>
              Kişisel verileriniz, KVKK&apos;nın 5. maddesinde yer alan
              &ldquo;bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya
              ilgili olması&rdquo; (üyelik sözleşmesi) ve &ldquo;veri
              sorumlusunun meşru menfaati&rdquo; (kötüye kullanımın
              önlenmesi) hukuki sebeplerine dayanılarak işlenmektedir. Yurt
              dışına aktarım söz konusu olduğunda ayrıca açık rızanız alınır
              (bkz. Madde 6).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              5. Toplama Yöntemi
            </h2>
            <p>
              Kişisel verileriniz, Platform&apos;daki formları doldurmanız
              yoluyla doğrudan sizden, IP adresi gibi bazı teknik veriler ise
              otomatik yollarla elektronik ortamda toplanır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              6. Kişisel Verilerin Aktarımı (Yurt Dışı Aktarım Dahil)
            </h2>
            <p className="mb-4">
              Platform, teknik altyapısını (veritabanı ve kimlik doğrulama)
              Supabase üzerinden sağlamaktadır; verileriniz İrlanda (AB)
              merkezli sunucularda barındırılmaktadır. Ayrıca güvenlik
              amacıyla Cloudflare ve tercihen Google (Google ile giriş
              özelliğini kullanırsanız) hizmetlerinden yararlanılmaktadır.
            </p>
            <p>
              Türkiye dışındaki ülkelere yapılan bu tür veri aktarımları
              KVKK kapsamında &ldquo;yurt dışına aktarım&rdquo; olarak
              değerlendirilmektedir. Platform&apos;un teknik altyapısı bu
              aktarımı gerektirdiğinden, üyelik işlemine devam etmeniz bu
              kapsamdaki aktarıma rıza gösterdiğiniz anlamına gelir.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              7. Saklama Süresi
            </h2>
            <p>
              Hesap verileriniz, hesabınız aktif olduğu sürece saklanır.
              Hesabınızı sildiğinizde profil bilgileriniz kalıcı olarak
              silinir; ancak paylaştığınız içerikler (maaş, yorum, mülakat
              deneyimi vb.) Platform&apos;un istatistiksel bütünlüğünü
              korumak amacıyla kullanıcı bağlantısı kaldırılarak
              (anonimleştirilerek) saklanmaya devam eder. İletişim formu
              mesajlarınız, talep sürecinin takibi amacıyla makul bir süre
              saklanır.
            </p>
          </div>

          <div className="rounded-2xl border-l-2 border-[var(--accent)] bg-[var(--card-light)] p-6">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              8. Anonim Paylaşım Hakkında Önemli Not
            </h2>
            <p className="text-[var(--text-dark)]">
              Paylaşım yaparken &ldquo;Anonim paylaş&rdquo; seçeneğini
              işaretlemeniz, yalnızca kullanıcı adınızın ve profilinizin
              diğer kullanıcılara gösterilmemesi anlamına gelir. Paylaşımınız,
              veritabanı düzeyinde yine hesabınızla ilişkilendirilmiş olarak
              saklanır ve gerektiğinde (ör. hukuki talep, kötüye kullanım
              incelemesi) hesabınızla eşleştirilebilir. &ldquo;Anonim&rdquo;
              ifadesi, verinin sistemden tamamen kimliksizleştirildiği
              anlamına gelmez.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              9. Çerezler
            </h2>
            <p>
              Platform, oturumunuzu açık tutmak için yalnızca zorunlu kimlik
              doğrulama çerezleri kullanır. Reklam, analitik veya üçüncü
              taraf takip çerezi kullanılmamaktadır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              10. Veri Güvenliği
            </h2>
            <p>
              Kişisel verilerinizin güvenliğini sağlamak amacıyla şifreler
              hash&apos;lenerek saklanır, üyelik ve giriş işlemlerinde
              bot/otomasyon saldırılarına karşı Cloudflare Turnstile
              doğrulaması kullanılır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              11. Veri Sahibi Olarak Haklarınız
            </h2>
            <p>
              KVKK&apos;nın 11. maddesi uyarınca; kişisel verinizin işlenip
              işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep
              etme, işlenme amacını öğrenme, yurt içi/yurt dışı üçüncü
              kişilere aktarılıp aktarılmadığını öğrenme, eksik/yanlış
              işlenmişse düzeltilmesini isteme, KVKK&apos;da öngörülen
              şartlar çerçevesinde silinmesini/yok edilmesini isteme ve bu
              işlemlerin aktarılan üçüncü kişilere bildirilmesini isteme
              haklarına sahipsiniz.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              12. Değişiklikler
            </h2>
            <p>
              Bu metin güncellenebilir; güncel sürüm her zaman bu sayfada
              yer alır.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-dark)] mb-3">
              13. Başvuru Yöntemi
            </h2>
            <p>
              Haklarınızı kullanmak için{" "}
              <Link
                href="/contact"
                className="text-[var(--accent)] hover:underline"
              >
                iletişim sayfamız
              </Link>{" "}
              üzerinden bize ulaşabilirsiniz.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
