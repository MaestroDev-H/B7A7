import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { maintenanceService } from "@/lib/api/services/maintenance";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantMaintenanceView } from "@/components/features/maintenance/TenantMaintenanceView";

export const metadata: Metadata = {
  title: "Maintenance & Repairs",
  description: "Submit and track repair tickets for your rented unit.",
};

export default async function TenantMaintenancePage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.mine,
      queryFn: () => tenanciesService.getMyTenancies(serverFetch),
    },
    {
      queryKey: queryKeys.maintenance.mine(),
      queryFn: () => maintenanceService.getMyRequests(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantMaintenanceView />
    </HydrationBoundary>
  );
}
