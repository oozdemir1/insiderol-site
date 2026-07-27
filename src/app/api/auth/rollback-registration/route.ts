import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// Called when the profiles insert right after signUp() fails — without
// this, the auth user still exists with no profile row: they can never
// log in (username lookup finds nothing) and can never re-register with
// the same email/username either (the auth account is already taken).
// Deleting the orphaned auth user lets them just try registering again.
export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = createAdminClient();

  // This must never delete a real account. Without this check, anyone
  // who can see any user's id (e.g. leaked into a page payload elsewhere)
  // could POST it here and get that account permanently deleted — this
  // endpoint only exists to clean up an auth user that got left with no
  // matching profiles row, so refuse unless that's actually the case.
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profile) {
    return NextResponse.json(
      { ok: false, error: "Not an orphaned account" },
      { status: 403 }
    );
  }

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("rollback-registration: failed to delete orphaned auth user", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
