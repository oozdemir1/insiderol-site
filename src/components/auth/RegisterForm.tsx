"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  validatePasswordStrength,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/app/constants/validatePassword";
import Turnstile, { TurnstileHandle } from "./Turnstile";

export default function RegisterForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const translateAuthError = (message: string) => {
    if (message.includes("User already registered")) {
      return "Bu e-posta adresiyle zaten bir hesap var.";
    }

    return message;
  };

  async function handleRegister(e: React.FormEvent) {
  e.preventDefault();

  setErrorMessage("");

  const nextFieldErrors: {
    username?: string;
    email?: string;
    password?: string;
  } = {};

  if (!username.trim()) {
    nextFieldErrors.username = "Bu alan zorunlu.";
  }

  if (!email.trim()) {
    nextFieldErrors.email = "Bu alan zorunlu.";
  }

  if (validatePasswordStrength(password)) {
    nextFieldErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
  }

  setFieldErrors(nextFieldErrors);

  if (Object.keys(nextFieldErrors).length > 0) {
    return;
  }

  if (!captchaToken) {
    setErrorMessage("Lütfen captcha doğrulamasını tamamla.");
    return;
  }

  if (!agreedToTerms) {
    setErrorMessage("Devam etmek için Kullanım Şartları ve Gizlilik Politikası'nı kabul etmelisin.");
    return;
  }

  setLoading(true);

  const cleanUsername = username.trim().toLowerCase();

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (existingUser) {
    setLoading(false);
    setFieldErrors({ username: "Bu kullanıcı adı zaten kullanılıyor." });
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
      captchaToken,
    },
  });

  if (error) {
    setLoading(false);
    turnstileRef.current?.reset();
    setCaptchaToken(null);
    setErrorMessage(translateAuthError(error.message));
    return;
  }

  if (data.user) {

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      username: cleanUsername,
      email,
    });

  if (profileError) {
    console.error(profileError);

    // Without a profile row this account can never log in (username
    // lookup finds nothing) and the email/username are now stuck as
    // "taken" — roll the auth user back so they can just try again.
    // fetch() rejects on a real network failure (not just a non-2xx
    // status) — without this try/catch, that rejection would skip
    // setLoading(false)/setErrorMessage below and leave the form stuck
    // on "Kaydediliyor..." with no way to recover short of a reload.
    try {
      const rollbackRes = await fetch("/api/auth/rollback-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id }),
      });

      if (!rollbackRes.ok) {
        console.error(
          "rollback-registration responded with",
          rollbackRes.status
        );
      }
    } catch (rollbackError) {
      console.error(rollbackError);
    }

    setLoading(false);
    setErrorMessage(
      "Kayıt sırasında bir sorun oluştu. Lütfen tekrar dene."
    );
    return;
  }

}

  setLoading(false);
  setDone(true);
}

  if (done) {
    return (
      <p className="text-[var(--muted)] text-center py-4">
        Kayıt başarılı! Devam etmeden önce e-postana gönderdiğimiz
        onay bağlantısına tıklaman gerekiyor.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
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
          Kullanıcı adı
        </label>

        <input
          type="text"
          value={username}
          onFocus={() => setErrorMessage("")}
          onChange={(e) => {
            setUsername(e.target.value);

            if (fieldErrors.username) {
              setFieldErrors((prev) => ({
                ...prev,
                username: undefined,
              }));
            }
          }}
          className={`auth-input ${
            fieldErrors.username ? "!border-red-500" : ""
          }`}
        />

        {fieldErrors.username && (
          <p className="text-xs text-red-400 mt-1">
            {fieldErrors.username}
          </p>
        )}
      </div>

      <div>
        <label className="auth-label">
          E-posta
        </label>

        <input
          type="email"
          value={email}
          onFocus={() => setErrorMessage("")}
          onChange={(e) => {
            setEmail(e.target.value);

            if (fieldErrors.email) {
              setFieldErrors((prev) => ({
                ...prev,
                email: undefined,
              }));
            }
          }}
          className={`auth-input ${
            fieldErrors.email ? "!border-red-500" : ""
          }`}
        />

        {fieldErrors.email && (
          <p className="text-xs text-red-400 mt-1">
            {fieldErrors.email}
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

      <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => {
            setAgreedToTerms(e.target.checked);
            setErrorMessage("");
          }}
          className="mt-0.5"
        />

        <span>
          <Link href="/terms" target="_blank" className="text-[var(--accent)] hover:underline">
            Kullanım Şartları
          </Link>{" "}
          ve{" "}
          <Link href="/privacy" target="_blank" className="text-[var(--accent)] hover:underline">
            Gizlilik Politikası
          </Link>
          &apos;nı okudum, kabul ediyorum.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="auth-submit-btn disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Kaydol"}
      </button>

    </form>
  );
}
