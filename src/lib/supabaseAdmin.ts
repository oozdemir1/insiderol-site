import { createClient } from "@supabase/supabase-js";

// Server-only — uses the service role key, which bypasses RLS and can call
// the Admin API (e.g. auth.admin.deleteUser). Never import this from a
// client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
