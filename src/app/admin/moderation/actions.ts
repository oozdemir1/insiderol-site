"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { slugifyCompanyName } from "@/app/constants/companyUtils";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";
import { MODERATED_TABLES } from "./moderatedTables";

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized");
  }
}

// After an approve/reject propagation loop over MODERATED_TABLES, confirms
// no row was left behind still pointing at the given pending name+status.
// The loop itself can't tell "0 rows because this table never had a match"
// (expected on 5 of 6 tables, every single run) apart from "0 rows because
// RLS silently blocked the one table that should have matched" — so instead
// of trying to count up front, this re-checks after the fact: if anything
// is still sitting there, something was silently skipped, and the caller
// should fail loudly instead of marking the pending item as resolved.
async function assertPropagationComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nameColumn: "pending_role_name" | "pending_company_name",
  statusColumn: "role_status" | "company_status",
  name: string,
  context: string
) {
  for (const table of MODERATED_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq(nameColumn, name)
      .eq(statusColumn, "pending")
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      throw new Error(
        `${context}: ${table} tablosunda hâlâ "${name}" için bekleyen satır var (muhtemelen RLS engelledi). İşlem tamamlanmadı.`
      );
    }
  }
}

export async function markContactMessageRead(id: number) {
  const supabase = await createClient();

  await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "markContactMessageRead: 0 rows updated (muhtemelen RLS engelledi)"
    );
  }

  revalidatePath("/admin/moderation");
}

export async function deleteContactMessage(id: number) {
  const supabase = await createClient();

  await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "deleteContactMessage: 0 rows deleted (muhtemelen RLS engelledi)"
    );
  }

  revalidatePath("/admin/moderation");
}



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
  // Zero matched rows here is expected (not every table has an entry for
  // every role) — only a real Postgres/RLS error should fail this loudly.
  const { error: propagateError } = await supabase
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
    );

  if (propagateError) {
    throw new Error(propagateError.message);
  }
}

  await assertPropagationComplete(
    supabase,
    "pending_role_name",
    "role_status",
    roleName,
    "approveRole"
  );

  // Mark pending role approved
const { data: pendingRole } =
  await supabase
    .from("pending_roles")
    .select("suggested_name")
    .eq("id", pendingRoleId)
    .single();

  const { data: pendingUpdateData, error: pendingError } =
    await supabase
      .from("pending_roles")
      .update({
        status: "approved",
      })
      .eq("id", pendingRoleId)
      .select();

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (!pendingUpdateData || pendingUpdateData.length === 0) {
    throw new Error(
      "approveRole: 0 rows updated on pending_roles (muhtemelen RLS engelledi)"
    );
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
  companyName: string,
  details: {
    website: string | null;
    hqCity: number | null;
    industry: number | null;
    logoUrl: string | null;
  }
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

  // The moderated tables (salaries, reviews, ...) still carry whatever
  // name the submitter originally typed in pending_company_name — the
  // admin may have just corrected companyName in this same submit, so
  // match those rows against the original suggested_name, not the
  // (possibly just-edited) companyName.
  const { data: pendingCompany } =
    await supabase
      .from("pending_companies")
      .select("suggested_name")
      .eq("id", pendingCompanyId)
      .single();

  const originalSuggestedName =
    pendingCompany?.suggested_name ?? companyName;

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
        website: details.website,
        hq_city: details.hqCity,
        industry: details.industry,
        logo_url: details.logoUrl,
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
          originalSuggestedName
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

  await assertPropagationComplete(
    supabase,
    "pending_company_name",
    "company_status",
    originalSuggestedName,
    "approveCompany"
  );

  const { data: pendingUpdateData, error: pendingError } =
    await supabase
      .from("pending_companies")
      .update({
        status: "approved",
        company_id: companyId,
      })
      .eq("id", pendingCompanyId)
      .select();

  if (pendingError) {
    throw new Error(
      pendingError.message
    );
  }

  if (!pendingUpdateData || pendingUpdateData.length === 0) {
    throw new Error(
      "approveCompany: 0 rows updated on pending_companies (muhtemelen RLS engelledi)"
    );
  }

  revalidatePath(
    "/admin/moderation"
  );
}

// Fixes a mistake on an already-approved company (wrong sector, broken
// logo link, typo'd name, etc.) — the only path for that today is editing
// the companies row by hand in Supabase. Deliberately does NOT recompute
// slug from a name change: the slug is the company page's URL, and quietly
// changing it on a name edit could break links already shared/indexed.
export async function updateCompany(
  companyId: number,
  details: {
    name: string;
    website: string | null;
    hqCity: number | null;
    industry: number | null;
    logoUrl: string | null;
  }
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

  const { data, error } =
    await supabase
      .from("companies")
      .update({
        name: details.name,
        search_name: normalizeSearchText(details.name),
        website: details.website,
        hq_city: details.hqCity,
        industry: details.industry,
        logo_url: details.logoUrl,
      })
      .eq("id", companyId)
      .select();

  if (error) {
    throw new Error(error.message);
  }

  // A silently-matched-0-rows update (RLS filtering the row instead of
  // erroring) is the failure mode this table has already bitten us with
  // once — fail loudly instead of pretending the save worked.
  if (!data || data.length === 0) {
    throw new Error(
      "updateCompany: 0 rows updated (muhtemelen RLS engelledi)"
    );
  }

  revalidatePath("/admin/moderation");
  revalidatePath("/companies");
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

const { data: pendingUpdateData, error } = await supabase
  .from("pending_roles")
  .update({
    status: "rejected",
  })
  .eq("id", pendingRoleId)
  .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!pendingUpdateData || pendingUpdateData.length === 0) {
    throw new Error(
      "rejectRole: 0 rows updated on pending_roles (muhtemelen RLS engelledi)"
    );
  }

  
if (pendingRole?.suggested_name) {
  for (const table of MODERATED_TABLES) {
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

  await assertPropagationComplete(
    supabase,
    "pending_role_name",
    "role_status",
    pendingRole.suggested_name,
    "rejectRole"
  );
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

  const { data: pendingUpdateData, error } =
    await supabase
      .from("pending_companies")
      .update({
        status: "rejected",
      })
      .eq("id", pendingCompanyId)
      .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!pendingUpdateData || pendingUpdateData.length === 0) {
    throw new Error(
      "rejectCompany: 0 rows updated on pending_companies (muhtemelen RLS engelledi)"
    );
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

    await assertPropagationComplete(
      supabase,
      "pending_company_name",
      "company_status",
      pendingCompany.suggested_name,
      "rejectCompany"
    );
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

  const { data: pendingUpdateData, error } =
    await supabase
      .from("pending_roles")
      .update({
        suggested_name:
          suggestedName.trim(),
      })
      .eq("id", pendingRoleId)
      .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!pendingUpdateData || pendingUpdateData.length === 0) {
    throw new Error(
      "updatePendingRole: 0 rows updated on pending_roles (muhtemelen RLS engelledi)"
    );
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

  await assertPropagationComplete(
    supabase,
    "pending_role_name",
    "role_status",
    pendingRole.suggested_name,
    "updatePendingRole"
  );
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

  await requireAdmin(supabase);

  if (!MODERATED_TABLES.includes(tableName)) {
    throw new Error("Invalid table");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(tableName)
    .update({
      moderation_status: "approved",
    })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Same "RLS silently matched 0 rows" failure mode as updateCompany —
  // fail loudly instead of showing a moderator a fake success.
  if (!data || data.length === 0) {
    throw new Error(
      "approveContent: 0 rows updated (muhtemelen RLS engelledi)"
    );
  }

  const { error: logError } = await supabase
    .from("content_moderation_log")
    .insert({
      table_name: tableName,
      content_id: id,
      action: "approved",
      performed_by: user?.id ?? null,
    });

  // The approve itself already succeeded above (row-count checked) —
  // don't throw here, or a log-insert failure would look to the admin
  // like the approve failed when it actually went through.
  if (logError) {
    console.error(
      "approveContent: content_moderation_log insert failed",
      logError
    );
  }

  revalidatePath("/admin/moderation");
}

export async function rejectContent(
  tableName: string,
  id: number
) {
  const supabase = await createClient();

  await requireAdmin(supabase);

  if (!MODERATED_TABLES.includes(tableName)) {
    throw new Error("Invalid table");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(tableName)
    .update({
      moderation_status: "rejected",
    })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "rejectContent: 0 rows updated (muhtemelen RLS engelledi)"
    );
  }

  const { error: logError } = await supabase
    .from("content_moderation_log")
    .insert({
      table_name: tableName,
      content_id: id,
      action: "rejected",
      performed_by: user?.id ?? null,
    });

  // Same rationale as approveContent: the reject already succeeded, so
  // a log-insert failure shouldn't be surfaced as if the reject failed.
  if (logError) {
    console.error(
      "rejectContent: content_moderation_log insert failed",
      logError
    );
  }

  revalidatePath("/admin/moderation");
}

export async function saveContentEdits(
  formData: FormData
) {
  "use server";

  const supabase =
    await createClient();

  await requireAdmin(supabase);

  const tableName =
    String(formData.get("tableName"));

  if (!MODERATED_TABLES.includes(tableName)) {
    throw new Error("Invalid table");
  }

  const id = Number(
    formData.get("id")
  );

  const title =
    String(formData.get("title") ?? "");

  const review =
    String(formData.get("review") ?? "");

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

const { data, error } = await supabase
  .from(tableName)
  .update(updateData)
  .eq("id", id)
  .select();

if (error) {
  throw new Error(error.message);
}

if (!data || data.length === 0) {
  throw new Error(
    "saveContentEdits: 0 rows updated (muhtemelen RLS engelledi)"
  );
}

revalidatePath(
  `/admin/moderation/content/${tableName}/${id}`
);
}