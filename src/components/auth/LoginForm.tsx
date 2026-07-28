"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Turnstile, { TurnstileHandle } from "./Turnstile";

export default function LoginForm({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  // Supabase's error messages come back in English — map the common
  // ones to Turkish and fall back to the raw message for anything else
  // rather than leaving it silently untranslated.
  const translateAuthError = (message: string) => {
    if (message.includes("Invalid login credentials")) {
      return "E-posta/kullanıcı adı veya şifre hatalı.";
    }

    if (message.includes("Email not confirmed")) {
      return "E-posta adresin henüz onaylanmamış. Gelen kutunu kontrol et.";
    }

    return message;
  };

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  setErrorMessage("");

  const nextFieldErrors: { identifier?: string; password?: string } = {};

  if (!identifier.trim()) {
    nextFieldErrors.identifier = "Bu alan zorunlu.";
  }

  if (!password.trim()) {
    nextFieldErrors.password = "Bu alan zorunlu.";
  }

  setFieldErrors(nextFieldErrors);

  if (Object.keys(nextFieldErrors).length > 0) {
    return;
  }

  if (!captchaToken) {
    setErrorMessage("Lütfen captcha doğrulamasını tamamla.");
    return;
  }

  setLoading(true);

  let loginEmail = identifier;

  if (!identifier.includes("@")) {

    // Resolved via a server-side route (service-role lookup), not a
    // direct client query — see src/app/api/auth/resolve-username.
    const resolveRes = await fetch("/api/auth/resolve-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: identifier }),
    });

    const { email } = await resolveRes.json();

    if (!email) {
      // Deliberately the same generic message as a wrong password below
      // — a distinct "user not found" message would let someone
      // enumerate which usernames exist on the platform.
      setErrorMessage("E-posta/kullanıcı adı veya şifre hatalı.");
      setLoading(false);
      return;
    }

    loginEmail = email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
    options: { captchaToken },
  });

  setLoading(false);

  if (error) {
    turnstileRef.current?.reset();
    setCaptchaToken(null);
    setErrorMessage(translateAuthError(error.message));
    return;
  }

  onSuccess?.();
}

  return (
    <form
  onSubmit={handleLogin}
  className="space-y-4"
>

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
      onFocus={() => setErrorMessage("")}
      onChange={(e) => {
        setIdentifier(e.target.value);

        if (fieldErrors.identifier) {
          setFieldErrors((prev) => ({
            ...prev,
            identifier: undefined,
          }));
        }
      }}
      className={`auth-input ${
        fieldErrors.identifier ? "!border-red-500" : ""
      }`}
    />

    {fieldErrors.identifier && (
      <p className="text-xs text-red-400 mt-1">
        {fieldErrors.identifier}
      </p>
    )}

  </div>

  <div>

    <label className="auth-label">
      Şifre
    </label>

    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onFocus={() => setErrorMessage("")}
        onChange={(e) => {
          setPassword(e.target.value);

          if (fieldErrors.password) {
            setFieldErrors((prev) => ({
              ...prev,
              password: undefined,
            }));
          }
        }}
        className={`auth-input pr-10 ${
          fieldErrors.password ? "!border-red-500" : ""
        }`}
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>

    {fieldErrors.password && (
      <p className="text-xs text-red-400 mt-1">
        {fieldErrors.password}
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
    disabled={loading}
    className="auth-submit-btn disabled:opacity-50"
  >
    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
  </button>

  <div className="text-center">

    <a
      href="/account-recovery"
      className="
        text-sm
        text-[var(--muted)]
        hover:text-white
        transition
      "
    >
      Hesabıma erişemiyorum
    </a>

  </div>

</form>
  );
}