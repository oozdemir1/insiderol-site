import { supabase } from "@/lib/supabase";

// Returns the signed-in user's saved default-anonymity preference, or
// null when logged out / no profile row yet — callers should leave the
// form's hardcoded default (true) untouched in that case.
export async function fetchDefaultAnonymity(): Promise<boolean | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_anonymous")
    .eq("id", user.id)
    .single();

  return profile?.default_anonymous ?? null;
}
