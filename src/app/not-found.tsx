import Link from "next/link";

export default function NotFound() {
  return (
    <main
    style={{ backgroundColor: "var(--background)" }}
    className="min-h-screen flex items-center justify-center px-4"
  >
<div className="card-light rounded-2xl p-10 md:p-12 max-w-md w-full min-h-[275px] flex flex-col justify-center text-center -translate-y-10">
          <h1 className="text-xl font-semibold text-[var(--text-dark)]">
          404 | Sayfa Bulunamadı!
        </h1>

        <p className="mt-2 text-sm text-[var(--muted-dark)]">
          Aradığınız sayfa bulunamadı. Bu sayfa kaldırılmış ya da hiç var olmamış olabilir.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/companies"
            className="company-cta-btn cta-btn text-white/90"
          >
            Şirketleri Keşfet
          </Link>

          <Link
            href="/"
            className="company-cta-btn bg-black/5 text-[var(--text-dark)] hover:bg-black/10"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
