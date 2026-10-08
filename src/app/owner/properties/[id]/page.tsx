import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { propertiesService } from "@/lib/api/services/properties";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerPropertyManageView } from "@/components/features/owner/OwnerPropertyManageView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await propertiesService.getById(serverFetch, id);
    const title = res.title || "Property Details";
    return {
      title: `Manage ${title}`,
      description: "Manage property listings, room inventories, and activity logs.",
    };
  } catch {
    return {
      title: "Manage Property",
    };
  }
}

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.properties.detail(id),
      queryFn: () => propertiesService.getById(serverFetch, id),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerPropertyManageView propertyId={id} />
    </HydrationBoundary>
  );
}

