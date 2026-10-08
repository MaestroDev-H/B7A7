import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { applicationsService } from "@/lib/api/services/applications";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerApplicationsView } from "@/components/features/owner/OwnerApplicationsView";

export const metadata: Metadata = {
  title: "Rental Applications",
  description: "Review and approve tenant tenancy applications and lease agreements.",
};

export default async function OwnerApplicationsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.applications.incoming(),
      queryFn: () => applicationsService.getIncoming(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerApplicationsView />
    </HydrationBoundary>
  );
}
