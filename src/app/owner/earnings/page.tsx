import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { propertiesService } from "@/lib/api/services/properties";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerEarningsView } from "@/components/features/owner/OwnerEarningsView";

export const metadata: Metadata = {
  title: "Financial & Earnings Analytics",
  description: "View occupancy metrics, projected monthly rent, and revenue collection breakdowns.",
};

export default async function OwnerEarningsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.properties.my(),
      queryFn: () => propertiesService.getMyProperties(serverFetch),
    },
    {
      queryKey: queryKeys.tenancies.all(),
      queryFn: () => tenanciesService.getAll(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerEarningsView />
    </HydrationBoundary>
  );
}
