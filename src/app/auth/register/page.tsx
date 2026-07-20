"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import { supabase } from "@/lib/supabase";
import AuthGoogleButton from "@/components/auth/AuthGoogleButton";
import AuthDivider from "@/components/auth/AuthDivider";


export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
         <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200">

        <h1 className="text-3xl font-bold mb-2 text-center">
       Kaydol
      </h1>

      
      <div className="text-center mb-8">

        <span className="text-white">
          insider
        </span>

        <span className="text-[var(--accent)]">
          ol
        </span>

        {"'a katıl."}

      </div>

        <AuthGoogleButton />
        <AuthDivider />
        <RegisterForm />
</div>
      </div>
    </main>
  );
}