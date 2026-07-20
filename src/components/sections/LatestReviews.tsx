export default function LatestReviews() {
  return (
    <section className="py-28 px-8 bg-[var(--section-light)] text-[var(--text-dark)]">

  {/* Container’ı full width yapıyoruz */}
  <div className="w-full">

    {/* HEADER */}
    <div className="mb-12 max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)]">
        Son Yorumlar
      </h2>
      <p className="text-[var(--muted-dark)] text-lg mt-4">
        Çalışanların anonim şirket deneyimleri
      </p>
    </div>

    {/* REVIEWS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
      {/* Card 1 */}
      <div className="w-full border border-white/10 bg-[var(--card-green)] rounded-3xl p-8 hover:bg-[var(--card-green-hover)] transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Trendyol</h3>
            <p className="text-sm text-white/70 mt-1">Backend Developer</p>
          </div>
          <div className="text-white/80 text-sm">★ 4.2</div>
        </div>
        <p className="text-white/80 leading-8 mt-6">
          Maaşlar piyasanın üstünde ancak work-life balance zaman zaman zorlayıcı olabiliyor.
        </p>
      </div>

      {/* Card 2 */}
      <div className="w-full border border-white/10 bg-[var(--card-green)] rounded-3xl p-8 hover:bg-[var(--card-green-hover)] transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Trendyol</h3>
            <p className="text-sm text-white/70 mt-1">Backend Developer</p>
          </div>
          <div className="text-white/80 text-sm">★ 4.2</div>
        </div>
        <p className="text-white/80 leading-8 mt-6">
          Maaşlar piyasanın üstünde ancak work-life balance zaman zaman zorlayıcı olabiliyor.
        </p>
      </div>

      {/* Card 3 */}
      <div className="w-full border border-white/10 bg-[var(--card-green)] rounded-3xl p-8 hover:bg-[var(--card-green-hover)] transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Insider</h3>
            <p className="text-sm text-white/70 mt-1">Product Designer</p>
          </div>
          <div className="text-white/80 text-sm">★ 4.5</div>
        </div>
        <p className="text-white/80 leading-8 mt-6">
          Ekip kültürü oldukça güçlü. Remote çalışma konusunda esnek bir yapı var.
        </p>
      </div>
    </div>
  </div>
</section>
  );
}