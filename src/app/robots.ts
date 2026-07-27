import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://insiderol.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/auth",
        "/auth/*",
        "/account-recovery",
        "/my-posts",
        "/my-posts/*",
        "/profile",
        "/settings",
        "/review",
        "/review/*",
        "/api",
        "/api/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
