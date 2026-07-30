"use server";
import { normalizeRoleName } from "@/app/constants/roleUtils";
import { createClient } from "@/lib/server";
import { slugifyCompanyName } from "@/app/constants/companyUtils";
import { INDUSTRIES } from "@/app/constants/industries";
import { turkishCities } from "@/app/constants/turkishCities";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";

import { redirect } from "next/navigation";

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

export async function importRolesCsv(
  formData: FormData
) {

 const supabase =
    await createClient();

  await requireAdmin(supabase);

  const file = formData.get(
    "file"
  ) as File;

  const csvText =
    await file.text();

  const rows = csvText
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

 const dataRows = rows.slice(1);

 let inserted = 0;
  let skipped = 0;
  let failed = 0;
  let aliasesInserted = 0;

for (const row of dataRows) {
  // Second column is optional: pipe-separated aliases for the role,
  // e.g. "Göz Hastalıkları Uzmanı,Göz Doktoru|Göz Uzmanı" — pipe instead
  // of comma since this parser doesn't handle quoted CSV fields.
  const [rawName, rawAliases] = row.split(",");
  const roleName = rawName?.trim();

  if (!roleName) {
    continue;
  }

const normalizedName =
  normalizeRoleName(roleName);

const { data: existing } =
  await supabase
    .from("roles")
    .select("id")
    .eq(
      "normalized_name",
      normalizedName
    )
    .maybeSingle();

let roleId = existing?.id as number | undefined;

if (existing) {
  skipped++;
} else {
  const { data: newRole, error } =
    await supabase
      .from("roles")
      .insert({
        name: roleName,
        normalized_name:
          normalizedName,
      })
      .select("id")
      .single();

  if (error) {
    failed++;
    continue;
  }

  roleId = newRole.id;
  inserted++;
}

  // Backfill aliases even for a role that already existed (skipped
  // above), so re-running the same CSV after adding this column fills
  // in aliases for roles seeded before it existed.
  const aliasList = (rawAliases ?? "")
    .split("|")
    .map((alias) => alias.trim())
    .filter(Boolean);

  for (const alias of aliasList) {
    const normalizedAlias =
      normalizeSearchText(alias);

    // An alias identical to the role's own name is redundant — the
    // direct roles.normalized_name search already covers it.
    if (normalizedAlias === normalizedName) {
      continue;
    }

    const { data: existingAlias } =
      await supabase
        .from("role_aliases")
        .select("id")
        .eq(
          "normalized_alias",
          normalizedAlias
        )
        .maybeSingle();

    if (existingAlias) {
      continue;
    }

    const { error: aliasError } =
      await supabase
        .from("role_aliases")
        .insert({
          role_id: roleId,
          alias,
          normalized_alias: normalizedAlias,
        });

    if (!aliasError) {
      aliasesInserted++;
    }
  }
}

console.log({
  inserted,
  skipped,
  failed,
  aliasesInserted,
});
redirect(
  `/admin/import-content?roleInserted=${inserted}&roleSkipped=${skipped}&roleFailed=${failed}&roleAliasesInserted=${aliasesInserted}`
);}

export async function importCompaniesCsv(
  formData: FormData
) {

const supabase =
  await createClient();

  await requireAdmin(supabase);

  const file = formData.get(
    "file"
  ) as File;

  const csvText =
    await file.text();

  const rows = csvText
  .split("\n")
  .map((row) => row.trim())
  .filter(Boolean);

const companyRows =
  rows.slice(1);

let inserted = 0;
let skipped = 0;
let failed = 0;

const errors: string[] = [];

for (const row of companyRows) {

  const [
    name,
    website,
    industry,
    hqCity,
    logoUrl,
  ] = row.split(",");

  if (!name?.trim()) {
  continue;
}

  const industryId =
  INDUSTRIES.find(
    (x) => x.name === industry
  )?.id;

const cityId =
  turkishCities.find(
    (x) => x.name === hqCity
  )?.id;

if (!industryId) {
  failed++;

  errors.push(
    `${name}: Geçersiz sektör (${industry})`
  );

  continue;
}

if (!cityId) {
  failed++;

  errors.push(
    `${name}: Geçersiz şehir (${hqCity})`
  );

  continue;
}

const slug =
slugifyCompanyName(name);

const { data: existing } =
  await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
  skipped++;
  continue;
  }

const { error } =
  await supabase
    .from("companies")
    .insert({
      name,
      search_name: normalizeSearchText(name),
      slug,
      website,
      industry: industryId,
      hq_city: cityId,
      logo_url: logoUrl,

      is_verified: true,

      review_count: 0,
      salary_count: 0,

      average_rating: 0,
      average_salary: 0,
    });

if (error) {

  failed++;

  errors.push(
    `${name}: ${error.message}`
  );
} else {
  inserted++;
}
}
console.log({
  inserted,
  skipped,
  failed,
  errors,
});
redirect(
  `/admin/import-content?inserted=${inserted}&skipped=${skipped}&failed=${failed}`
);
}