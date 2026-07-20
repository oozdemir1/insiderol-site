export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] px-8 pb-10 pt-24">

      <div className="max-w-6xl mx-auto border-t border-white/10 pt-10">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

          {/* LEFT */}
          <div>

            <a
              href="/"
              className="text-2xl font-bold tracking-tight"
            >
              <span className="text-white">
                insider
              </span>

              <span className="text-[var(--accent)]">
                ol
              </span>
            </a>

            <p className="text-[var(--muted)] mt-4 leading-7 max-w-md">
              anonim çalışan deneyimi
            </p>

          </div>

          {/* LINKS */}
          <div className="flex flex-wrap gap-10 text-sm">

            <div className="flex flex-col gap-4">

              <div className="text-white font-medium">
                Platform
              </div>

              <a
                href="/companies"
                className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
              >
                Şirketler
              </a>

              <a
                href="/contact"
                className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
              >
                İletişim
              </a>

            </div>

            <div className="flex flex-col gap-4">

              <div className="text-white font-medium">
                Topluluk
              </div>

              <a
                href="/register"
                className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
              >
                Kaydol
              </a>

              <a
                href="/login"
                className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
              >
                Giriş Yap
              </a>

            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-16 pt-8 border-t border-white/5">

          <p className="text-sm text-[var(--muted)]">
            © 2026 insiderol. Tüm hakları saklıdır.
          </p>

          <div className="flex items-center gap-6 text-sm">

            <a
              href="#"
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
            >
              Gizlilik Politikası
            </a>

            <a
              href="#"
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
            >
              Kullanım Şartları
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}