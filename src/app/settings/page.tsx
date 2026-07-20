import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import PasswordSection from "./PasswordSection";
import EmailSection from "./EmailSection";
import AnonymityToggle from "./AnonymityToggle";
import DeleteAccountSection from "./DeleteAccountSection";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_anonymous")
    .eq("id", user.id)
    .single();

  // Google-only accounts have no password identity — offering a
  // "change password"/"change email" form for them would be meaningless
  // (there's no local credential this project manages, and their email
  // is tied to their Google account, not something to reassign here).
  const hasPassword = (user.identities || []).some(
    (identity) => identity.provider === "email"
  );

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-xl font-semibold text-[var(--text-dark)] mb-6">
        Ayarlar
      </h1>

      <div className="flex flex-col gap-6">
        <section className="card-light rounded-[1.25rem] p-6 md:p-8">
          <h2 className="text-md font-semibold text-[var(--text-dark)] mb-4">
            E-posta
          </h2>

          <EmailSection
            currentEmail={user.email || ""}
            hasPassword={hasPassword}
          />
        </section>

        <section className="card-light rounded-[1.25rem] p-6 md:p-8">
          <h2 className="text-md font-semibold text-[var(--text-dark)] mb-4">
            Şifre Değiştir
          </h2>

          <PasswordSection
            currentEmail={user.email || ""}
            hasPassword={hasPassword}
          />
        </section>

        <section className="card-light rounded-[1.25rem] p-6 md:p-8">
          <h2 className="text-md font-semibold text-[var(--text-dark)] mb-4">
            Anonimlik
          </h2>

          <AnonymityToggle
            userId={user.id}
            initialValue={profile?.default_anonymous ?? true}
          />
        </section>

        <section className="card-light rounded-[1.25rem] p-6 md:p-8">
          <h2 className="text-md font-semibold text-[var(--text-dark)] mb-4">
            Hesabı Sil
          </h2>

          <DeleteAccountSection />
        </section>
      </div>
    </main>
  );
}
