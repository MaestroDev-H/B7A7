import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { propertiesService } from "@/lib/api/services/properties";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerPropertiesView } from "@/components/features/owner/OwnerPropertiesView";

export const metadata: Metadata = {
  title: "My Properties",
  description: "Manage your listings, rooms, and publish visibility.",
};

export default async function OwnerPropertiesPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.properties.my(),
      queryFn: () => propertiesService.getMyProperties(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerPropertiesView />
    </HydrationBoundary>
  );
}
