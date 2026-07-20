// Shown as a single unified message wherever password strength fails,
// rather than the specific rule from validatePasswordStrength below —
// simpler for the user than a different message per missing rule.
export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Şifre en az 6 karakter olmalı, en az 1 harf ve 1 rakam içermeli.";

// Mirrors the Supabase project's password policy (Authentication →
// Providers → Email → Password requirements: "Letters and digits") —
// kept in sync manually since Supabase doesn't expose that config to
// the client. Catching it here avoids a round-trip to get the same
// rejection back as a raw English API error.
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 6) {
    return "Şifre en az 6 karakter olmalı.";
  }

  if (!/[a-zA-Z]/.test(password)) {
    return "Şifre en az bir harf içermeli.";
  }

  if (!/[0-9]/.test(password)) {
    return "Şifre en az bir rakam içermeli.";
  }

  return null;
}
