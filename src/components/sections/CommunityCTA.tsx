export default function CommunityCTA() {
  return (
    <section className="py-32 px-8 bg-[var(--section-light-2)]">

      <div className="max-w-5xl mx-auto">

        <div className="border border-white/10 bg-[var(--surface)] rounded-[40px] p-10 md:p-16 text-center shadow-2xl shadow-black/20">

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-[var(--surface-2)] rounded-full px-4 py-2 text-sm text-[var(--muted)] mb-8">

            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />

            Anonymous community driven platform

          </div>

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">

            Gerçek çalışan deneyimlerini
            <br />

            anonim şekilde paylaş.

          </h2>

          {/* SUBTITLE */}
          <p className="text-[var(--muted)] text-lg md:text-xl leading-9 mt-8 max-w-3xl mx-auto">

            Maaşları, çalışma kültürünü ve şirket deneyimlerini paylaşarak
            binlerce kişinin daha bilinçli kariyer kararları vermesine yardımcı ol.

          </p>

          {/* CTA */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">

            <a
              href="/register"
              className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:bg-[var(--accent-hover)] transition-all duration-200"
            >
              Topluluğa Katıl
            </a>

            <a
              href="/companies"
              className="border border-white/10 bg-[var(--surface-2)] px-8 py-4 rounded-2xl hover:bg-[var(--surface)] transition-all duration-200"
            >
              Şirketleri Keşfet
            </a>

          </div>

        </div>

      </div>

    </section>
  );
}