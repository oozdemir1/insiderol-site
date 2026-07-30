"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { landAfterAuth } from "@/lib/authLanding";

export default function AuthCallbackPage() {

  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {

    async function run() {
      const landed = await landAfterAuth(supabase, router);

      // No session — an expired/already-consumed link (e.g. an email
      // security scanner that prefetched it before the user clicked),
      // a link opened on a second device, or a double-click. Previously
      // this silently bounced to the homepage with no explanation.
      if (!landed) {
        setFailed(true);
      }
    }

    run();

  }, [router]);

  if (failed) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 text-center text-white">
        <div>
          <p className="text-[var(--muted)] mb-4">
            Giriş bağlantısının süresi dolmuş ya da zaten kullanılmış
            olabilir.
          </p>

          <a
            href="/auth/login"
            className="text-[var(--accent)] hover:underline"
          >
            Giriş sayfasına dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 text-white">
      Yükleniyor...
    </div>
  );
}
