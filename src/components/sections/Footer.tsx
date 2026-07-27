export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] px-8 pb-5 pt-12">

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">

        <div>
          <a
            href="/"
            className="text-3xl font-bold tracking-tight"
          >
            <span className="text-white">
              insider
            </span>

            <span className="text-[var(--accent)]">
              ol
            </span>
          </a>

          <p className="text-[var(--muted)] mt-1 leading-7">
            anonim çalışan deneyimi
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-2 text-sm">

          <a
            href="/about"
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
          >
            Hakkımızda
          </a>

          <span className="text-white/15">·</span>

          <a
            href="/contact"
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
          >
            İletişim
          </a>

          <span className="text-white/15">·</span>

          <a
            href="/privacy"
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
          >
            Gizlilik Politikası
          </a>

          <span className="text-white/15">·</span>

          <a
            href="/terms"
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
          >
            Kullanım Şartları
          </a>

        </div>

      </div>

      <p className="text-xs text-[var(--muted)] opacity-70 text-center mt-10">
        © 2026 insiderol. Tüm hakları saklıdır.
      </p>

    </footer>
  );
}
