"use client";

import { useRef, useState } from "react";
import { MailPlus } from "lucide-react";
import Turnstile, { TurnstileHandle } from "@/components/auth/Turnstile";
import FormSuccessMessage from "@/components/ui/FormSuccessMessage";
import { CheckCircle2 } from "lucide-react";

const CAPTCHA_REQUIRED = process.env.NODE_ENV === "production";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 255;
const SUBJECT_MAX_LENGTH = 150;
const MESSAGE_MAX_LENGTH = 500;

export default function ContactPage() {
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
            İLETİŞİM
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Bize ulaş
          </h1>

          <p className="text-[var(--muted)] text-lg leading-8 mt-6 max-w-2xl mx-auto">
            Bir sorunuz, geri bildiriminiz ya da şirket profiliyle ilgili bir
            talebiniz mi var? Aşağıdaki formu doldurun, size dönüş yapalım.
          </p>
        </div>
      </section>

      <section className="py-20 px-8">
        <div className="max-w-xl mx-auto">
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
                <div className="relative">
                  <textarea
                    value={message}
                    onFocus={() => setErrorMessage("")}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={MESSAGE_MAX_LENGTH}
                    className="form-field pb-6"
                    rows={5}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-[var(--muted-dark)] pointer-events-none">
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
                disabled={loading || (CAPTCHA_REQUIRED && !captchaToken)}
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
