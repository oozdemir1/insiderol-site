import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// Username -> email lookup, needed so the login form can accept either.
// Runs server-side with the service-role key specifically so this isn't a
// client-side query against `profiles` — a public RLS grant permissive
// enough for that would let anyone with the anon key (public by design)
// enumerate every username's email directly via the Supabase REST API,
// with no need to go through this app at all.
export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ email: null });
  }

  const admin = createAdminClient();

  // Usernames are always stored lowercase (see RegisterForm.tsx) — match
  // that here, otherwise a user who types their own username with any
  // different casing gets a false "wrong credentials".
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  return NextResponse.json({ email: profile?.email ?? null });
}
