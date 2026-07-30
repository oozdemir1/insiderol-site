import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

// Called right after supabase.auth.signUp() on the client. That call
// returns a user but no session while email confirmation is pending, so
// a client-side insert into profiles runs as the anon role and gets
// rejected by RLS (auth.uid() = id can't match with no session yet).
// Using the service-role client here bypasses that.
export async function POST(request: NextRequest) {
  const { userId, username, email } = await request.json();

  if (
    typeof userId !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    !userId ||
    !username ||
    !email
  ) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Confirms this is really the auth user signUp() just created (not an
  // id supplied by an attacker) and catches Supabase's enumeration-safe
  // signUp response — when the email already belongs to an existing
  // account, signUp() returns success with a user whose identities array
  // is empty instead of an error.
  const { data: authUser, error: getUserError } =
    await admin.auth.admin.getUserById(userId);

  if (getUserError || !authUser.user || authUser.user.email !== email) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 400 });
  }

  if (authUser.user.identities?.length === 0) {
    return NextResponse.json(
      { ok: false, error: "email_taken" },
      { status: 409 }
    );
  }

  const { error: insertError } = await admin
    .from("profiles")
    .insert({ id: userId, username, email });

  if (insertError) {
    if (insertError.code === "23505") {
      const field = insertError.message.includes("username")
        ? "username_taken"
        : "email_taken";

      return NextResponse.json({ ok: false, error: field }, { status: 409 });
    }

    console.error("complete-registration: profile insert failed", insertError);
    return NextResponse.json({ ok: false, error: "unknown" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
