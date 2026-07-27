import type { MetadataRoute } from "next";
import { createClient } from "@/lib/server";
import { slugifyText } from "@/app/constants/normalizationUtils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://insiderol.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: companies }, { data: roles }] = await Promise.all([
    supabase.from("companies").select("slug, created_at"),
    supabase.from("roles").select("id, name, created_at"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/companies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/roles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/explore`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/share`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const companyRoutes: MetadataRoute.Sitemap = (companies || []).map(
    (company) => ({
      url: `${siteUrl}/companies/${company.slug}`,
      lastModified: company.created_at
        ? new Date(company.created_at)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const roleRoutes: MetadataRoute.Sitemap = (roles || []).map((role) => ({
    url: `${siteUrl}/roles/${role.id}-${slugifyText(role.name)}`,
    lastModified: role.created_at ? new Date(role.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...companyRoutes, ...roleRoutes];
}
