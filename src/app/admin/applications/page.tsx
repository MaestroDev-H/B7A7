import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { applicationsService } from "@/lib/api/services/applications";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerApplicationsView } from "@/components/features/owner/OwnerApplicationsView";

export const metadata: Metadata = {
  title: "Platform Applications Oversight",
  description: "Administrative oversight on rental applications across all residential listings.",
};

export default async function AdminApplicationsPage() {
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
