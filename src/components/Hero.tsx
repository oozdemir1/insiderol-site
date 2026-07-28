import Link from "next/link";
import {
  MessageSquarePlus,
  Compass,
  Building2,
  Briefcase,
  ArrowRight,
} from "lucide-react";
export default function Hero() {
  return (
    <section className="hero-section">

      {/* Background Grid */}
      <div className="hero-grid" />

      {/* Glow Effects */}
      <div className="hero-glow hero-glow-accent" />

      <div className="hero-glow hero-glow-lime" />

      {/* Content */}
      <div className="hero-container">



        {/* Title */}
        <h1 className="hero-title">

  <span className="text-white">
    insider
  </span>

  <span className="text-[var(--accent)]">
    ol
  </span>

</h1>

{/* Badge */}
<div className="hero-badge mt-2">

  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1" />
  <span className="mt-1">
    anonim çalışan deneyimi
  </span>
  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1" />

</div>


        {/* CTA */}
        <div className="hero-actions">

         <div className="grid gap-5 grid-cols-2 xl:grid-cols-4 mt-5">

  {/* Paylaş */}
  <Link
  href="/share"
  className="hero-cta-card group"
>
    <div className="hero-cta-icon">
     <MessageSquarePlus size={22} />
    </div>

    <div className="hero-cta-content">
      <h3 className="hero-cta-title flex items-center gap-1.5">
        Paylaş
        <ArrowRight
          size={18}
          className="text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white/60"
        />
      </h3>

      <p className="hero-cta-description">
        Maaş ve çalışan deneyimlerini paylaş.
        </p>
    </div>
  </Link>

  {/* Şirketler */}
  <Link href="/companies" className="hero-cta-card group">
    <div className="hero-cta-icon">
      <Building2 size={22} />
    </div>

    <div className="hero-cta-content">
      <h3 className="hero-cta-title flex items-center gap-1.5">
        Şirketler
        <ArrowRight
          size={18}
          className="text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white/60"
        />
      </h3>

      <p className="hero-cta-description">
        Şirketleri incele ve karşılaştır.
      </p>
    </div>
  </Link>

  {/* Pozisyonlar */}
  <Link href="/roles" className="hero-cta-card group">
    <div className="hero-cta-icon">
      <Briefcase size={22} />
    </div>

    <div className="hero-cta-content">
      <h3 className="hero-cta-title flex items-center gap-1.5">
        Pozisyonlar
        <ArrowRight
          size={18}
          className="text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white/60"
        />
      </h3>

      <p className="hero-cta-description">
        Pozisyon maaşlarını ve yorumlarını incele.
      </p>
    </div>
  </Link>

  {/* Keşfet */}
  <Link href="/explore" className="hero-cta-card group">
    <div className="hero-cta-icon">
      <Compass size={22} />
    </div>

    <div className="hero-cta-content">
      <h3 className="hero-cta-title flex items-center gap-1.5">
        Keşfet
        <ArrowRight
          size={18}
          className="text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white/60"
        />
      </h3>

      <p className="hero-cta-description">
          Maaşları ve şirket verilerini filtrele.
          </p>
    </div>
  </Link>

</div>

          


        </div>

      </div>

    </section>
  );
}