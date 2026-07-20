"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  validatePasswordStrength,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/app/constants/validatePassword";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Her iki alan da zorunlu.");
      return;
    }

    if (validatePasswordStrength(password)) {
      setErrorMessage(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    // Relies on the recovery session Supabase's client already
    // established from the token in this page's URL (the link from
    // the reset email) — no separate token handling needed here.
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "Bağlantının süresi dolmuş olabilir. Lütfen yeni bir sıfırlama bağlantısı iste."
      );
      return;
    }

    setDone(true);

    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Yeni Şifre Belirle
          </h1>

          {done ? (
            <p className="text-[var(--muted)] text-center mt-6">
              Şifren güncellendi. Ana sayfaya yönlendiriliyorsun...
            </p>
          ) : (
            <>
              <p className="text-[var(--muted)] mb-8 text-center">
                Hesabın için yeni bir şifre gir.
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
                  <label className="auth-label">Yeni şifre</label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onFocus={() => setErrorMessage("")}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="auth-label">Yeni şifre (tekrar)</label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onFocus={() => setErrorMessage("")}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn disabled:opacity-50"
                >
                  {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
