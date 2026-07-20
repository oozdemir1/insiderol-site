"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EmailSection({
  currentEmail,
  hasPassword,
}: {
  currentEmail: string;
  hasPassword: boolean;
}) {
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  if (!hasPassword) {
    return (
      <div className="flex flex-col gap-3">
        <input
          type="email"
          value={currentEmail}
          disabled
          className="form-field opacity-60 cursor-not-allowed"
        />

        <p className="text-sm text-[var(--muted-dark)]">
          Bu hesap Google ile giriş yapıyor, bu yüzden e-posta adresi
          buradan değiştirilemez — hesabın e-postası Google hesabınla
          eşleşiyor.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (email.trim() === currentEmail) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      email: email.trim(),
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: "Onay bağlantısı yeni ve eski e-posta adresine gönderildi. Değişiklik onaylanana kadar mevcut e-postan geçerli kalır.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-field"
      />

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
        disabled={loading || email.trim() === currentEmail || !email.trim()}
        className="form-btn self-start disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "E-postayı Güncelle"}
      </button>
    </form>
  );
}
