"use client";

import { useEffect } from "react";

// Without this, a throw from any admin server action (approveRole,
// saveContentEdits, etc.) had nowhere to land — Next.js fell back to its
// default full-page error UI. This keeps the admin inside a page that
// still looks like the app and lets them retry or bail back to the queue.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <div className="company-card p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-3">
          Bir hata oluştu
        </h1>

        <p className="text-sm text-[var(--muted-dark)] mb-2">
          {error.message || "İşlem tamamlanamadı."}
        </p>

        {error.digest && (
          <p className="text-xs text-[var(--muted-dark)] mb-6">
            Referans kodu: {error.digest}
          </p>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="form-btn"
          >
            Tekrar dene
          </button>

          <a
            href="/admin/moderation"
            className="form-btn form-btn-secondary"
          >
            Moderasyona dön
          </a>
        </div>
      </div>
    </div>
  );
}
