import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nestlyliving.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/owner",
          "/owner/*",
          "/dashboard",
          "/dashboard/*",
          "/payment",
          "/payment/*",
          "/api/*",
          "/dev/*",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
