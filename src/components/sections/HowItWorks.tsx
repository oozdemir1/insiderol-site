"use client";

import React from "react";

// Adımlar array'i
const steps = [
  {
    number: "01",
    title: "Şirket ara",
    description: "Merak ettiğin şirketin maaşlarını ve çalışan yorumlarını incele."
  },
  {
    number: "02",
    title: "Anonim paylaş",
    description: "Maaşını kimliğini paylaşmadan sisteme ekle."
  },
  {
    number: "03",
    title: "Piyasayı öğren",
    description: "Gerçek verilerle teklifleri ve piyasayı karşılaştır."
  },
  {
    number: "04",
    title: "Mülakat deneyimi",
    description: "Şirketlerde sorulan mülakat sorularını ve deneyimleri keşfet."
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-[var(--section-light-2)] py-28 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Başlık */}
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-dark)] text-center">
          Nasıl çalışır?
        </h2>
        <p className="text-[var(--muted-dark)] text-base md:text-lg mt-4 mx-auto leading-8 text-center">
          Gerçek çalışan deneyimleriyle şirket kültürünü, maaşları ve çalışma koşullarını keşfet.
        </p>

        {/* Kartlar container */}
        <div className="flex flex-wrap justify-center gap-6 mt-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex-1 max-w-[calc(25%-1rem)] min-w-[250px] border border-white/10 hiw-card rounded-3xl backdrop-blur-xl p-8 transition-all duration-200"
            >
              <div className="text-5xl font-bold text-white/20">{step.number}</div>
              <h3 className="text-2xl font-semibold mt-6 text-white">{step.title}</h3>
              <p className="text-white/80 mt-4 leading-7">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}