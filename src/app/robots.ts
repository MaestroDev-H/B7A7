import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/utils";

const APP_URL = getAppUrl();

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
