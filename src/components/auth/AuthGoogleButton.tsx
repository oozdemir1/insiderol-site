"use client";

import { supabase } from "@/lib/supabase";

export default function AuthGoogleButton() {

  async function handleGoogleLogin() {

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
          // The actual post-auth destination comes from
          // localStorage["redirectAfterAuth"] (set by the caller before
          // opening the auth flow) — read back in /auth/callback.
          redirectTo: `${window.location.origin}/auth/callback`,
          // Without this, Google silently reuses whatever Google session
          // is already active in the browser and skips the account
          // chooser entirely — surprising right after logging out and
          // clicking this again expecting to be asked which account.
          queryParams: {
            prompt: "select_account",
          },
      },
    });
  }

  return (

    <button
      type="button"
      onClick={handleGoogleLogin}
      className="
        w-full

        flex items-center justify-center
        gap-3

        rounded-xl

        border border-white/10

        bg-white
        hover:bg-white/92

        px-4 py-3

        text-[15px]
        font-medium
        text-black

        transition-all duration-200
      "
    >

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5"
      >

        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
        />

        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />

        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
        />

        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6 7l6.2 5.2C39.7 36.4 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
        />

      </svg>

      Devam Et

    </button>

  );
}