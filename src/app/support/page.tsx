"use client";

import { useRef, useState } from "react";
import { MailPlus, ChevronDown } from "lucide-react";
import Turnstile, { TurnstileHandle } from "@/components/auth/Turnstile";
import FormSuccessMessage from "@/components/ui/FormSuccessMessage";
import { CheckCircle2 } from "lucide-react";

const CAPTCHA_REQUIRED = process.env.NODE_ENV === "production";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 255;
const SUBJECT_MAX_LENGTH = 150;
const MESSAGE_MAX_LENGTH = 500;

const FAQ_ITEMS = [
  {
    question: "Paylaşımlarım gerçekten anonim mi?",
    answer:
      "Varsayılan olarak evet — isim/kullanıcı adı paylaşımlarında gösterilmez, sadece şirket/pozisyon/veri görünür. İstersen anonim değil, kullanıcı adınla da paylaşabilirsin.",
  },
  {
    question: "Şirketimi veya pozisyonumu listede bulamıyorum, ne yapmalıyım?",
    answer:
      "Formda yeni bir isim yazabilirsin; bu bir öneri olarak incelemeye gönderilir, onaylandıktan sonra sistemde görünür ve paylaşımınla otomatik eşleşir.",
  },
  {
    question: "Paylaşımım neden \"beklemede\" görünüyor, ne zaman yayınlanır?",
    answer:
      "Her paylaşım, spam ve kötüye kullanımı önlemek için önce incelemeden geçiyor. Bu genelde kısa sürede tamamlanır.",
  },
  {
    question: "Hesabımı silersem paylaşımlarım da silinir mi?",
    answer:
      "Hesabın silinir, ama anonim paylaşımların (maaş, yorum, mülakat deneyimi vb.) veri bütünlüğü için sistemde kalmaya devam eder — artık hiçbir şekilde sana bağlanamaz.",
  },
  {
    question: "Neden paylaşım yaparken bir doğrulama (captcha) istiyorsunuz?",
    answer: "Botların ve otomatik spam paylaşımların önüne geçmek için.",
  },
  {
    question: "\"Çok fazla bekleyen paylaşımın var\" hatası alıyorum, bu ne demek?",
    answer:
      "Kısa sürede çok fazla paylaşım/öneri gönderildiğinde, önceki paylaşımların incelenmesini beklemen istenir — bu da kötüye kullanımı önlemeye yönelik bir kural.",
  },
  {
    question: "Paylaşılan bilgilerin doğruluğunu nasıl kontrol ediyorsunuz?",
    answer:
      "Her paylaşım yayınlanmadan önce moderasyon ekibi tarafından gözden geçiriliyor; buna rağmen bilgiler kullanıcı beyanına dayanır.",
  },
  {
    question: "Yanlış, saldırgan veya kötü niyetli bir paylaşım gördüm, ne yapmalıyım?",
    answer:
      "Aşağıdaki destek formundan bize bildirebilirsin, en kısa sürede inceleyip gerekeni yaparız.",
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="form-shell divide-y divide-black/10">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() =>
                setOpenIndex(isOpen ? null : index)
              }
              className="w-full flex items-center justify-between gap-4 py-4 text-left font-medium text-[var(--text-dark)]"
            >
              {item.question}

              <ChevronDown
                size={18}
                className={`shrink-0 text-[var(--muted-dark)] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="pb-4 text-sm text-[var(--muted-dark)] leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMessage("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    if (
      name.length > NAME_MAX_LENGTH ||
      email.length > EMAIL_MAX_LENGTH ||
      subject.length > SUBJECT_MAX_LENGTH ||
      message.length > MESSAGE_MAX_LENGTH
    ) {
      setErrorMessage("Bir veya daha fazla alan izin verilen uzunluğu aşıyor.");
      return;
    }

    if (CAPTCHA_REQUIRED && !captchaToken) {
      setErrorMessage("Lütfen captcha doğrulamasını tamamla.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message, turnstileToken: captchaToken }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setErrorMessage(data.error || "Mesaj gönderilemedi, lütfen tekrar deneyin.");
      return;
    }

    setDone(true);
  }

  return (
    <main className="bg-[var(--background)]">
      <section className="bg-[var(--surface)] py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-wide uppercase text-[var(--accent)] mb-4">
            DESTEK
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Sana nasıl yardımcı olabiliriz?
          </h1>

          <p className="text-[var(--muted)] text-lg leading-8 mt-6 max-w-2xl mx-auto">
            Aşağıda sık sorulan soruları bulabilirsin. Aradığın cevap yoksa
            iletişim formunu doldur, sana dönüş yapalım.
          </p>
        </div>
      </section>

      <section className="bg-[var(--section-light)] py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-dark)] text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>

          <FaqAccordion />
        </div>
      </section>

      <section className="bg-[var(--section-light-2)] py-20 px-8">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-dark)] text-center mb-8">
            Bize ulaş
          </h2>

          {done ? (
            <FormSuccessMessage
              icon={<CheckCircle2 className="text-[var(--accent)]" size={28} />}
              title="Mesajın iletildi!"
              message="En kısa sürede sana dönüş yapacağız."
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="form-shell space-y-4"
            >
              {errorMessage && (
                <div className="form-error py-2">{errorMessage}</div>
              )}

              <div>
                <label className="form-label block mb-2">
                  İsim <span className="text-[var(--muted-dark)] font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onFocus={() => setErrorMessage("")}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={NAME_MAX_LENGTH}
                  className="form-field"
                />
              </div>

              <div>
                <label className="form-label block mb-2">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onFocus={() => setErrorMessage("")}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={EMAIL_MAX_LENGTH}
                  className="form-field"
                />
              </div>

              <div>
                <label className="form-label block mb-2">Konu</label>
                <input
                  type="text"
                  value={subject}
                  onFocus={() => setErrorMessage("")}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={SUBJECT_MAX_LENGTH}
                  className="form-field"
                />
              </div>

              <div>
                <label className="form-label block mb-2">Mesaj</label>
                <textarea
                  value={message}
                  onFocus={() => setErrorMessage("")}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX_LENGTH}
                  className="form-field"
                  rows={5}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-[var(--muted-dark)]">
                    {message.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              {CAPTCHA_REQUIRED ? (
                <Turnstile
                  ref={turnstileRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                />
              ) : (
                <p className="text-xs text-[var(--muted-dark)]">
                  Captcha yerel geliştirmede devre dışı.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full disabled:opacity-50"
              >
                {loading ? (
                  "Gönderiliyor..."
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <MailPlus size={16} />
                    Gönder
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
