import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { applicationsService } from "@/lib/api/services/applications";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantApplicationsView } from "@/components/features/applications/TenantApplicationsView";

export const metadata: Metadata = {
  title: "My Rental Applications",
  description: "View and manage your pending and approved room applications.",
};

export default async function TenantApplicationsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.applications.mine,
      queryFn: () => applicationsService.getMyApplications(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantApplicationsView />
    </HydrationBoundary>
  );
}
