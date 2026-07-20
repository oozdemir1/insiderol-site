"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  validatePasswordStrength,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/app/constants/validatePassword";

export default function PasswordSection({
  currentEmail,
  hasPassword,
}: {
  currentEmail: string;
  hasPassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  if (!hasPassword) {
    return (
      <p className="text-sm text-[var(--muted-dark)]">
        Bu hesap Google ile giriş yapıyor ve ayrı bir şifresi yok, bu nedenle bu kullanıcı hesabı için
        şifre değiştir seçeneği mevcut değil.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (validatePasswordStrength(password)) {
      setMessage({ type: "error", text: PASSWORD_REQUIREMENTS_MESSAGE });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Şifreler eşleşmiyor." });
      return;
    }

    setLoading(true);

    // Re-authenticate with the current password first — updateUser()
    // trusts the active session as-is, so without this check anyone
    // with an unlocked, logged-in tab could lock the real owner out.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    if (reauthError) {
      setLoading(false);
      setMessage({ type: "error", text: "Mevcut şifre yanlış." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setMessage({ type: "success", text: "Şifren güncellendi." });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      

      <div className="grid gap-3 md:grid-cols-3">
        <input
        type="password"
        placeholder="Mevcut şifre"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="form-field"
      />
        <input
          type="password"
          placeholder="Yeni şifre"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-field"
        />

        <input
          type="password"
          placeholder="Yeni şifre (tekrar)"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-field"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "error" ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={
          loading || !currentPassword || !password || !confirmPassword
        }
        className="form-btn self-start disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
