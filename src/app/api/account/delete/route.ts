import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Hesap silme şu anda yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY eksik).",
      },
      { status: 500 }
    );
  }

  // Salary/review/etc. rows keep user_id set to this id — the schema's
  // ON DELETE SET NULL on those tables (see the SQL handed off alongside
  // this route) orphans them instead of cascading, per the product
  // decision to keep anonymous posts after account deletion.
  await supabase.from("profiles").delete().eq("id", user.id);

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
