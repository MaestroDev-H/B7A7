import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { propertiesService } from "@/lib/api/services/properties";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { AdminPropertiesView } from "@/components/features/admin/AdminPropertiesView";

export const metadata: Metadata = {
  title: "Property Moderation",
  description: "Review, inspect, and moderate published properties across the platform.",
};

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; type?: string; city?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const type = params.type !== "ALL" ? params.type : undefined;
  const city = params.city || undefined;
  const search = params.search || undefined;

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.properties.all({ page, limit, type, city, search }),
      queryFn: () => propertiesService.getAll(serverFetch, { page, limit, type, city, search }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminPropertiesView />
    </HydrationBoundary>
  );
}
