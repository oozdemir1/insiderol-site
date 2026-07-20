"use client";

import LoginForm from "@/components/auth/LoginForm";
import AuthGoogleButton from "@/components/auth/AuthGoogleButton";
import AuthDivider from "@/components/auth/AuthDivider";


export default function LoginPage() {

  const handleLoginSuccess = () => {
    const redirect = localStorage.getItem("redirectAfterAuth");
    localStorage.removeItem("redirectAfterAuth");
    window.location.href = redirect || "/";
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200 ">
        
        <h1 className="text-3xl font-bold mb-2 text-center">
          Giriş Yap
        </h1>

        <p className="text-[var(--muted)] mb-8 text-center">
          <>
          <span className="text-white">
            insider
          </span>

          <span className="text-[var(--accent)]">
            ol
          </span>

          {" "}hesabına giriş yap.
        </>
        </p>
        <AuthGoogleButton />
        <AuthDivider />
        <LoginForm onSuccess={handleLoginSuccess} />

      </div></div>
    </main>
  );
}