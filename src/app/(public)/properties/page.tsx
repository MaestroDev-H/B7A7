import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Building2, SearchX } from "lucide-react";
import * as z from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyCard } from "@/components/features/properties/PropertyCard";
import { FilterBar } from "@/components/features/properties/FilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Property, Paginated, PropertyType } from "@/lib/api/types";

import { getAppUrl } from "@/lib/utils";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Browse Properties",
  description:
    "Explore verified co-living residences, apartments, and boutique room inventories with transparent pricing.",
  openGraph: {
    title: "Browse Properties | Nestly",
    description:
      "Explore verified co-living residences, apartments, and boutique room inventories with transparent pricing.",
    url: `${appUrl}/properties`,
  },
};

const API_BASE_URL = (
  process.env.API_BASE_URL || "https://b7-a6-six.vercel.app/api/v1"
).replace(/\/$/, "");

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(12),
  city: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  minRent: z.coerce.number().optional(),
  maxRent: z.coerce.number().optional(),
  sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const parsed = searchParamsSchema.safeParse(resolvedParams);
  const query = parsed.success ? parsed.data : searchParamsSchema.parse({});

  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.city) params.set("city", query.city);
  if (query.type && query.type !== "ALL") params.set("type", query.type);
  if (query.search) params.set("search", query.search);
  if (query.minRent !== undefined) params.set("minRent", String(query.minRent));
  if (query.maxRent !== undefined) params.set("maxRent", String(query.maxRent));
  params.set("sortBy", query.sortBy);
  params.set("order", query.order);

  let properties: Property[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const res = await fetch(`${API_BASE_URL}/properties?${params.toString()}`, {
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const json: {
        success: boolean;
        data: Property[];
        meta?: { total: number; totalPages: number; page: number; limit: number };
      } = await res.json();
      properties = Array.isArray(json.data) ? json.data : [];
      total = json.meta?.total || properties.length;
      totalPages = json.meta?.totalPages || 1;
    }
  } catch {
    // Gracefully handle server failure
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl">
      <PageHeader
        title="Discover Properties"
        description="Search boutique co-living spaces with real-time occupancy and verified room DoorPlates."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Properties" },
        ]}
      />

      <React.Suspense fallback={<div className="h-12 bg-muted/30 rounded-xl animate-pulse" />}>
        <FilterBar />
      </React.Suspense>

      {/* Listings Grid */}
      {properties.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-4 border-t border-border/60">
            <Pagination
              page={query.page}
              limit={query.limit}
              total={total}
              totalPages={totalPages}
            />
          </div>
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-muted/10 space-y-4 max-w-lg mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base">No properties found</h3>
            <p className="text-xs text-muted-foreground">
              No active listings match your selected filters. Try broadening your search or resetting filters.
            </p>
          </div>
          <Link
            href="/properties"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Clear All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
