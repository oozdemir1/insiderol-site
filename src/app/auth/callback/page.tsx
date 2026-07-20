"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {

  const router = useRouter();

  useEffect(() => {

    async function checkProfile() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // no user
      if (!user) {
        router.push("/");
        return;
      }

      // check profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .single();

      // no profile
      if (!profile?.username) {

        router.push("/auth/complete-profile");

      } else {

  const redirectPath =
    localStorage.getItem(
      "redirectAfterAuth"
    );

  if (redirectPath) {

    localStorage.removeItem(
      "redirectAfterAuth"
    );

    router.push(redirectPath);

  } else {

    router.push("/");
  }
}
    }

    checkProfile();

  }, [router]);

  return (
    <div className="p-10 text-white">
      Yükleniyor...
    </div>
  );
}