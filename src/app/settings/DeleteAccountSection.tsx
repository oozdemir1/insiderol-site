"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/account/delete", { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Hesap silinemedi.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="form-btn form-btn-secondary !text-red-500 hover:!text-red-600"
      >
        Hesabımı Sil
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--muted-dark)]">
        Bu işlem geri alınamaz. Hesabın kalıcı olarak silinir; daha önce
        anonim paylaştığın maaş/yorum gibi veriler sistemde kalmaya devam
        eder. Onaylamak için aşağıya <strong>SİL</strong> yaz.
      </p>

      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="SİL"
        className="form-field max-w-[200px]"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={confirmText !== "SİL" || loading}
          onClick={handleDelete}
          className="form-btn !bg-red-500 hover:!bg-red-600 !text-white disabled:opacity-50"
        >
          {loading ? "Siliniyor..." : "Kalıcı Olarak Sil"}
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setConfirmText("");
            setError("");
          }}
          className="form-btn form-btn-secondary"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}
