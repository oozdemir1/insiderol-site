"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Turnstile, { TurnstileHandle } from "@/components/auth/Turnstile";

export default function AccountRecoveryPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim()) {
      setFieldError("Bu alan zorunlu.");
      return;
    }

    if (!captchaToken) {
      setErrorMessage("Lütfen captcha doğrulamasını tamamla.");
      return;
    }

    setFieldError("");
    setLoading(true);

    let resetEmail = identifier.trim();

    if (!resetEmail.includes("@")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", resetEmail)
        .single();

      if (!profile) {
        // No matching username — show the same "sent" success state
        // anyway rather than a distinct error. A different message
        // here would let someone enumerate valid usernames the same
        // way a distinct "user not found" would on the login form.
        setLoading(false);
        setSent(true);
        return;
      }

      resetEmail = profile.email;
    }

    // Supabase never errors here for "email not found" either (handled
    // enumeration-safely at the API level) — an error means an actual
    // send failure (rate limit, SMTP issue, etc.), safe to surface.
    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
        captchaToken,
      }
    );

    setLoading(false);

    if (error) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setErrorMessage(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Hesabıma Erişemiyorum
          </h1>

          {sent ? (
            <p className="text-[var(--muted)] text-center mt-6">
              <span className=" text-white" >Bu bilgilerle eşleşen bir hesap varsa,</span> sıfırlama bağlantısı
              gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.
            </p>
          ) : (
            <>
              <p className="text-[var(--muted)] mb-8 text-center">
                E-posta veya kullanıcı adını gir, şifreni sıfırlaman için
                bir bağlantı gönderelim.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div
                    className="
                      rounded-xl
                      border border-red-500/20
                      bg-red-500/10
                      px-3 py-2
                      text-sm
                      text-red-300
                    "
                  >
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="auth-label">
                    E-posta veya kullanıcı adı
                  </label>

                  <input
                    type="text"
                    value={identifier}
                    onFocus={() => {
                      setErrorMessage("");
                      setFieldError("");
                    }}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    className={`auth-input ${
                      fieldError ? "!border-red-500" : ""
                    }`}
                  />

                  {fieldError && (
                    <p className="text-xs text-red-400 mt-1">
                      {fieldError}
                    </p>
                  )}
                </div>

                <Turnstile
                  ref={turnstileRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                />

                <button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="auth-submit-btn disabled:opacity-50"
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-6">
            <a
              href="/auth/login"
              className="text-sm text-[var(--muted)] hover:text-white transition"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
