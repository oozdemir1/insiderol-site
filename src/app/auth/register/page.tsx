"use client";

import RegisterPanel from "@/components/auth/RegisterPanel";

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-3xl p-8 shadow-2xl hover:bg-[var(--surface-2)] transition-all duration-200">
          <RegisterPanel />
        </div>
      </div>
    </main>
  );
}
