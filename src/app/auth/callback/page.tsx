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

        // Email/password sign-ups stash their chosen username in
        // user_metadata at registration time — the profiles row is only
        // created here, once confirming the email has produced an active
        // session. Doing it that way (rather than right after signUp)
        // means an unconfirmed/fake-email signup never occupies a
        // username or stores an unverified email in profiles. OAuth
        // sign-ins have no such metadata and fall through to picking a
        // username manually below.
        const pendingUsername = user.user_metadata?.username;

        if (pendingUsername) {
          const randomAvatarNumber = Math.floor(Math.random() * 10) + 1;

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: pendingUsername,
              email: user.email,
              avatar_url: `/avatars/avatar_${randomAvatarNumber}.png`,
            });

          if (!insertError) {
            router.push("/");
            return;
          }

          // A concurrent run of this same callback (e.g. the
          // confirmation link opened in two tabs) may have already
          // inserted this exact row — id is the primary key tied 1:1 to
          // this user, so if a profile now exists for it, that's what
          // happened. Treat it as success rather than falling through:
          // otherwise complete-profile's uniqueness check passes for
          // any new username and its upsert (matched on id) would
          // silently rename the profile that other run just created.
          // Only a genuine failure (someone else already has this
          // username) leaves no row at all.
          const { data: raceProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (raceProfile) {
            router.push("/");
            return;
          }
        }

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