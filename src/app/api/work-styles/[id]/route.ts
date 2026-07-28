import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function DELETE(
  request: Request,
  { params }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {

    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { data, error } =
    await supabase
      .from("company_work_style")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select();
if (error) {

  console.error(
    "DELETE WORK STYLE ERROR:",
    error
  );

  return NextResponse.json(
    {
      error: error.message,
    },
    {
      status: 500,
    }
  );
}

  // Same "RLS silently matched 0 rows" failure mode as the admin
  // moderation actions — fail loudly instead of reporting a fake success.
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          "Silme işlemi başarısız (0 satır etkilendi, muhtemelen RLS engelledi)",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}