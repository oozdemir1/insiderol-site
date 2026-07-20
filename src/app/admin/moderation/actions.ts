"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { slugifyCompanyName } from "@/app/constants/companyUtils";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";


const MODERATED_TABLES = [
  "salaries",
  "company_reviews",
  "company_work_style",
  "interview_experiences",
  "company_benefits",
  "company_compensation",
];



export async function approveRole(
  pendingRoleId: number,
  roleName: string
) {
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  throw new Error("Unauthorized");
}

const { data: profile } =
  await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

if (!profile?.is_admin) {
  throw new Error("Unauthorized");
}

  const normalizedName = roleName
    .toLowerCase()
    .trim();

  // Create role
  const { data: existingRole } =
  await supabase
    .from("roles")
    .select("id")
    .eq(
      "normalized_name",
      normalizedName
    )
    .maybeSingle();

let roleId = existingRole?.id;

if (!roleId) {
  const {
    data: newRole,
    error: roleError,
  } = await supabase
    .from("roles")
    .insert({
      name: roleName,
      normalized_name: normalizedName,
    })
    .select("id")
    .single();

  if (roleError) {
    throw new Error(roleError.message);
  }

  roleId = newRole.id;
}

for (const table of MODERATED_TABLES) {
  const before = await supabase
    .from(table)
    .select(
      "id,pending_role_name,role_status"
    )
    .eq(
      "pending_role_name",
      roleName
    );

  const result = await supabase
    .from(table)
    .update({
      role_id: roleId,
      pending_role_name: null,
      role_status: "approved",
    })
    .eq(
      "pending_role_name",
      roleName
    )
    .eq(
      "role_status",
      "pending"
    )
    .select();

}

  // Mark pending role approved
const { data: pendingRole } =
  await supabase
    .from("pending_roles")
    .select("suggested_name")
    .eq("id", pendingRoleId)
    .single();

  const { error: pendingError } =
    await supabase
      .from("pending_roles")
      .update({
        status: "approved",
      })
      .eq("id", pendingRoleId);

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (pendingRole?.suggested_name) {
  const { error: salaryError } =
    await supabase
      .from("salaries")
      .update({
        role_status: "approved",
      })
      .eq(
        "pending_role_name",
        pendingRole.suggested_name
      );

  if (salaryError) {
    throw new Error(
      salaryError.message
    );
  }
}

  revalidatePath(
    "/admin/moderation"
  );
}


export async function approveCompany(
  pendingCompanyId: number,
  companyName: string
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }

  const slug =
    slugifyCompanyName(
      companyName
    );

  const {
    data: existingCompany,
  } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let companyId =
    existingCompany?.id;

  if (!companyId) {
    const {
      data: newCompany,
      error: companyError,
    } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        search_name: normalizeSearchText(
          companyName
        ),
        slug,
      })
      .select("id")
      .single();

    if (companyError) {
      throw new Error(
        companyError.message
      );
    }

    companyId =
      newCompany.id;
  }

  for (const table of MODERATED_TABLES) {
    const { error } =
      await supabase
        .from(table)
        .update({
          company_id: companyId,
          pending_company_name:
            null,
          company_status:
            "approved",
        })
        .eq(
          "pending_company_name",
          companyName
        )
        .eq(
          "company_status",
          "pending"
        );

    if (error) {
      throw new Error(
        error.message
      );
    }
  }

  const { error: pendingError } =
    await supabase
      .from("pending_companies")
      .update({
        status: "approved",
      })
      .eq("id", pendingCompanyId);

  if (pendingError) {
    throw new Error(
      pendingError.message
    );
  }

  revalidatePath(
    "/admin/moderation"
  );
}

export async function rejectRole(
  pendingRoleId: number
) {
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  throw new Error("Unauthorized");
}

const { data: profile } =
  await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

if (!profile?.is_admin) {
  throw new Error("Unauthorized");
}

const { data: pendingRole } =
  await supabase
    .from("pending_roles")
    .select("suggested_name")
    .eq("id", pendingRoleId)
    .single();

const { error } = await supabase
  .from("pending_roles")
  .update({
    status: "rejected",
  })
  .eq("id", pendingRoleId);

  if (error) {
    throw new Error(error.message);
  }

  
if (pendingRole?.suggested_name) {
  for (const table of MODERATED_TABLES.filter(
    (t) => t !== "salaries"
  )) {
    const { error } =
      await supabase
        .from(table)
        .update({
          role_status:
            "rejected",
        })
        .eq(
          "pending_role_name",
          pendingRole.suggested_name
        );

    if (error) {
      throw new Error(
        error.message
      );
    }
  }
}

  revalidatePath(
    "/admin/moderation"
  );
}

export async function rejectCompany(
  pendingCompanyId: number
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }

  const { data: pendingCompany } =
    await supabase
      .from("pending_companies")
      .select("suggested_name")
      .eq("id", pendingCompanyId)
      .single();

  const { error } =
    await supabase
      .from("pending_companies")
      .update({
        status: "rejected",
      })
      .eq("id", pendingCompanyId);

  if (error) {
    throw new Error(error.message);
  }

  if (pendingCompany?.suggested_name) {
    for (const table of MODERATED_TABLES) {

      const { error } =
        await supabase
          .from(table)
          .update({
            company_status:
              "rejected",
          })
          .eq(
            "pending_company_name",
            pendingCompany.suggested_name
          );

      if (error) {
        throw new Error(
          error.message
        );
      }
    }
  }

  revalidatePath(
    "/admin/moderation"
  );
}

export async function updatePendingRole(
  pendingRoleId: number,
  suggestedName: string
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }

const { data: pendingRole } =
  await supabase
    .from("pending_roles")
    .select("suggested_name")
    .eq("id", pendingRoleId)
    .single();

  const { error } =
    await supabase
      .from("pending_roles")
      .update({
        suggested_name:
          suggestedName.trim(),
      })
      .eq("id", pendingRoleId);

  if (error) {
    throw new Error(error.message);
  }

  if (
  pendingRole?.suggested_name &&
  pendingRole.suggested_name !==
    suggestedName.trim()
) {
  for (const table of MODERATED_TABLES) {
  const { error } =
    await supabase
      .from(table)
      .update({
        pending_role_name:
          suggestedName.trim(),
      })
      .eq(
        "pending_role_name",
        pendingRole.suggested_name
      );

  if (error) {
    throw new Error(
      error.message
    );
  }
}
}

  revalidatePath(
    "/admin/moderation"
  );
}

export async function updatePendingCompany(
  pendingCompanyId: number,
  suggestedName: string
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }

  const { data: pendingCompany } =
    await supabase
      .from("pending_companies")
      .select("suggested_name")
      .eq("id", pendingCompanyId)
      .single();

  const { error } =
    await supabase
      .from("pending_companies")
      .update({
        suggested_name:
          suggestedName.trim(),
      })
      .eq("id", pendingCompanyId);

  if (error) {
    throw new Error(error.message);
  }

  if (
    pendingCompany?.suggested_name &&
    pendingCompany.suggested_name !==
      suggestedName.trim()
  ) {
    for (const table of MODERATED_TABLES) {
      const { error } =
        await supabase
          .from(table)
          .update({
            pending_company_name:
              suggestedName.trim(),
          })
          .eq(
            "pending_company_name",
            pendingCompany.suggested_name
          );

      if (error) {
        throw new Error(
          error.message
        );
      }
    }
  }

  revalidatePath(
    "/admin/moderation"
  );
}

export async function approveContent(
  tableName: string,
  id: number
) {
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

  await supabase
    .from(tableName)
    .update({
      moderation_status: "approved",
    })
    .eq("id", id);

    await supabase
  .from("content_moderation_log")
const { error } = await supabase
  .from("content_moderation_log")
  .insert({
    table_name: tableName,
    content_id: id,
    action: "approved",
    performed_by: user?.id ?? null,
  });

    revalidatePath("/admin/moderation");
}

export async function rejectContent(
  tableName: string,
  id: number
) {
  const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

  await supabase
    .from(tableName)
    .update({
      moderation_status: "rejected",
    })
    .eq("id", id);

    await supabase
  .from("content_moderation_log")
  .insert({
    table_name: tableName,
    content_id: id,
    action: "rejected",
    performed_by: user?.id ?? null,
  });

    revalidatePath("/admin/moderation");
}

export async function saveContentEdits(
  formData: FormData
) {
  "use server";

  const tableName =
    String(formData.get("tableName"));

  const id = Number(
    formData.get("id")
  );

  const title =
    String(formData.get("title") ?? "");

  const review =
    String(formData.get("review") ?? "");

  const supabase =
    await createClient();

  let updateData: any = {};

if (
  tableName ===
  "interview_experiences"
) {
  updateData.title =
    title;

  updateData.experience =
    review;

} else if (
  tableName ===
  "salaries"
) {
  updateData.comment =
    review;

} else if (
  tableName ===
  "company_benefits"
) {
  updateData.comment =
    review;

} else if (
  tableName ===
  "company_compensation"
) {
  updateData.comment =
    review;

} else if (
  tableName ===
  "company_work_style"
) {
  updateData.comment =
    review;

} else {
  updateData.title =
    title;

  updateData.review =
    review;
}

const { error } = await supabase
  .from(tableName)
  .update(updateData)
  .eq("id", id);

if (error) {
  console.error(error);
  return;
}

revalidatePath(
  `/admin/moderation/content/${tableName}/${id}`
);
}