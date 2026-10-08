import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { viewingsService } from "@/lib/api/services/viewings";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerViewingsView } from "@/components/features/owner/OwnerViewingsView";

export const metadata: Metadata = {
  title: "Viewing Requests",
  description: "Manage prospective tenant tour appointments and schedules.",
};

export default async function OwnerViewingsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.viewings.incoming(),
      queryFn: () => viewingsService.getIncoming(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerViewingsView />
    </HydrationBoundary>
  );
}
