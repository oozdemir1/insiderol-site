"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { landAfterAuth } from "@/lib/authLanding";

// Scanner-safe counterpart to /auth/reset-password: the token is only
// verified on a real button click, not on page load — a GET from an
// email security scanner (the same class of thing that made password
// reset links land in Junk and then die before the user could click
// them) can't burn this one-time token before the real user gets here.
// This page only activates once the "Confirm signup" email template in
// the Supabase dashboard is switched from {{ .ConfirmationURL }} to a
// link built from {{ .TokenHash }} pointing here — until then,
// /auth/callback remains the fallback for the old-style link.
function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || type !== "signup") {
      setErrorMessage(
        "Bağlantı geçersiz. Lütfen yeniden kaydolmayı dene."
      );
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "signup",
      });

      if (verifyError) {
        setErrorMessage(
          "Bağlantının süresi dolmuş olabilir. Lütfen yeniden kaydolmayı dene."
        );
        return;
      }

      const landed = await landAfterAuth(supabase, router);

      if (!landed) {
        setErrorMessage("Bir sorun oluştu. Lütfen tekrar dene.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Bir sorun oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Hesabını Onayla
          </h1>

          <p className="text-[var(--muted)] mb-8 text-center">
            Hesabını aktifleştirmek için aşağıdaki butona tıkla.
          </p>

          {errorMessage && (
            <div
              className="
                rounded-xl
                border border-red-500/20
                bg-red-500/10
                px-3 py-2
                text-sm
                text-red-300
                mb-4
              "
            >
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="auth-submit-btn disabled:opacity-50"
          >
            {loading ? "Onaylanıyor..." : "Hesabımı Onayla"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmForm />
    </Suspense>
  );
}
