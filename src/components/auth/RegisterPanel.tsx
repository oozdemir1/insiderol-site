"use client";

import { useState } from "react";
import RegisterForm from "./RegisterForm";
import AuthGoogleButton from "./AuthGoogleButton";
import AuthDivider from "./AuthDivider";

// Wraps RegisterForm with the heading/Google button and the pending-
// verification state. Kept as one component (rather than duplicating
// this in every place RegisterForm is used) because "Google ile devam
// et" and the "Kaydol" heading only make sense before registering —
// once signUp() has succeeded there's nothing left to continue with
// until the confirmation link is clicked, so showing them next to a
// "check your email" message reads as an unfinished/confusing state.
export default function RegisterPanel() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(
    null
  );

  if (registeredEmail) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center">
          E-posta Doğrulama
        </h1>

        <p className="text-[var(--muted)] text-center py-4">
          Devam etmeden önce{" "}
          <span className="text-white">{registeredEmail}</span>{" "}
          e-posta adresine gönderdiğimiz onay bağlantısına tıklaman
          gerekiyor.
        </p>
         <p className="text-[var(--muted)] text-center py-4">
        Lütfen gelen kutunun yanı sıra Spam ve Gereksiz (Junk) klasörlerini de kontrol etmeyi unutma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-center">Kaydol</h1>

      <div className="text-center mb-8">
        <span className="text-white">insider</span>
        <span className="text-[var(--accent)]">ol</span>
        {"'a katıl."}
      </div>

      <AuthGoogleButton />
      <AuthDivider />
      <RegisterForm onRegistered={setRegisteredEmail} />
    </div>
  );
}
