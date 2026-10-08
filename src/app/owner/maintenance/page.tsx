import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { maintenanceService } from "@/lib/api/services/maintenance";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerMaintenanceView } from "@/components/features/owner/OwnerMaintenanceView";

export const metadata: Metadata = {
  title: "Maintenance Kanban Board",
  description: "Track and resolve tenant maintenance requests and property repairs.",
};

export default async function OwnerMaintenancePage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.maintenance.incoming(),
      queryFn: () => maintenanceService.getIncoming(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerMaintenanceView />
    </HydrationBoundary>
  );
}
