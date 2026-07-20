"use server";
import { normalizeRoleName } from "@/app/constants/roleUtils";
import { createClient } from "@/lib/server";
import { slugifyCompanyName } from "@/app/constants/companyUtils";
import { INDUSTRIES } from "@/app/constants/industries";
import { turkishCities } from "@/app/constants/turkishCities";
import { normalizeSearchText } from "@/app/constants/normalizationUtils";

import { redirect } from "next/navigation";

export async function importRolesCsv(
  formData: FormData
) {

 const supabase =
    await createClient();
  
  const file = formData.get(
    "file"
  ) as File;

  const csvText =
    await file.text();

  const rows = csvText
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

 const roleNames = rows.slice(1);

 let inserted = 0;
  let skipped = 0;
  let failed = 0;

for (const roleName of roleNames) {
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

if (existing) {
  skipped++;
  continue;
}

const { error } =
  await supabase
    .from("roles")
    .insert({
      name: roleName,
      normalized_name:
        normalizedName,
    });

if (error) {
  failed++;
} else {
  inserted++;
}
}

console.log({
  inserted,
  skipped,
  failed,
});
redirect(
  `/admin/import-content?roleInserted=${inserted}&roleSkipped=${skipped}&roleFailed=${failed}`
);}

export async function importCompaniesCsv(
  formData: FormData
) {

const supabase =
  await createClient();

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