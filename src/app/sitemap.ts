import type { MetadataRoute } from "next";
import type { Property } from "@/lib/api/types";

import { getAppUrl } from "@/lib/utils";

const APP_URL = getAppUrl();
const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/properties",
    "/rooms",
    "/services",
    "/about",
    "/faq",
    "/contact",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const res = await fetch(`${API_BASE_URL}/properties?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticRoutes;

    const body: { success: boolean; data: Property[] } = await res.json();
    const properties = Array.isArray(body.data) ? body.data : [];

    const propertyRoutes = properties.map((prop) => ({
      url: `${APP_URL}/properties/${prop.id}`,
      lastModified: new Date(prop.updatedAt || prop.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...propertyRoutes];
  } catch {
    return staticRoutes;
  }
}
