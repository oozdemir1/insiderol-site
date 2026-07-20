"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompleteProfilePage() {

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const cleanUsername = username.trim().toLowerCase();

  async function handleCompleteProfile(
    e: React.FormEvent
  ) {

    e.preventDefault();

  const randomAvatarNumber = Math.floor(Math.random() * 10) + 1;
  const randomAvatar = `/avatars/avatar_${randomAvatarNumber}.png`;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // no user
    if (!user) {
      router.push("/");
      return;
    }

    // username taken?
    const { data: existingUser } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (existingUser) {

      setErrorMessage(
        "Bu kullanıcı adı zaten kullanılıyor."
        );

        setTimeout(() => {
        setErrorMessage("");
        }, 5000);

      setLoading(false);

      return;
    }

    // create profile
    const { error } = await supabase
      .from("profiles")
      .upsert([
        {
          id: user.id,
          email: user.email,
          username: cleanUsername,
          avatar_url: randomAvatar,
        },
      ]);

    if (error) {

      console.error(error);

      alert("Bir hata oluştu.");

      setLoading(false);

      return;
    }

    const redirect =
      localStorage.getItem(
        "redirectAfterAuth"
      );

    window.location.href =
    redirect || "/";

    localStorage.removeItem(
      "redirectAfterAuth"
    );
  }

  return (
    <section
      className="
        min-h-[calc(100vh-120px)]
        flex items-center justify-center
        bg-[rgba(223,233,227,0.06)]
        pb-44
        px-6
        text-white
      "
    >

      <div
        className="
          
          w-full max-w-sm
          rounded-3xl
          border border-white/12
          bg-[var(--surface)]
          backdrop-blur-xl
          shadow-2xl shadow-black/30
          p-8
        "
      >

        

        <h1 className="text-3xl font-bold text-center">

          <span className="text-white">
            insider
          </span>

          <span className="text-[var(--accent)]">
            ol
          </span>

        </h1>

     <div className="flex justify-center">

        <div
          className="
            inline-flex items-center gap-2

            rounded-full

            border border-white/8

            bg-white/[0.03]

            px-3 py-1

            text-xs
            text-white/45
          "
        >

          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />

          anonim profil

        </div>

      </div>

        <p
          className="
            mt-4
            text-center
            text-[var(--muted)]
            leading-7
          "
        >
          Anonim paylaşım için bir kullanıcı adı seç.
        </p>

        <form
          onSubmit={handleCompleteProfile}
          className="mt-8 space-y-6"
        >

           <div className="relative">

                {errorMessage && (
                    <div
                    className="
                        absolute top-0 left-0 right-0
                        rounded-xl
                        border border-red-500/20
                        bg-red-500/10
                        -mt-8
                        px-3 py-1.5
                        text-xs
                        text-red-300
                        text-center
                    "
                    >
                    {errorMessage}
                    </div>
                )}

                </div>

          <div>
            <label className="auth-label">
              Kullanıcı adı
            </label>
            <input
              autoComplete="username"
              pattern="^[a-zA-Z0-9_]+$"
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="auth-input"
            />

          </div>

          <button
  type="submit"
  disabled={loading}
  className="auth-submit-btn"
>
  {loading
    ? "Kaydediliyor..."
    : "Devam Et"}
</button>

        </form>

      </div>

    </section>
  );
}