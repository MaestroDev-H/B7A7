import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { requireRole } from "@/lib/auth/guard";
import { propertiesService } from "@/lib/api/services/properties";
import { applicationsService } from "@/lib/api/services/applications";
import { viewingsService } from "@/lib/api/services/viewings";
import { maintenanceService } from "@/lib/api/services/maintenance";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerOverview } from "@/components/features/owner/OwnerOverview";

export const metadata: Metadata = {
  title: "Owner Portal Overview",
  description: "Monitor residential units, rental requests, lease status, and repair requests.",
};

export default async function OwnerPage() {
  await requireRole("OWNER");

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.properties.my(),
      queryFn: () => propertiesService.getMyProperties(serverFetch),
    },
    {
      queryKey: queryKeys.applications.incoming(),
      queryFn: () => applicationsService.getIncoming(serverFetch),
    },
    {
      queryKey: queryKeys.viewings.incoming(),
      queryFn: () => viewingsService.getIncoming(serverFetch),
    },
    {
      queryKey: queryKeys.maintenance.incoming(),
      queryFn: () => maintenanceService.getIncoming(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerOverview />
    </HydrationBoundary>
  );
}
