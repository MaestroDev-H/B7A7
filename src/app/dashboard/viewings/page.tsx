import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { viewingsService } from "@/lib/api/services/viewings";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantViewingsView } from "@/components/features/viewings/TenantViewingsView";

export const metadata: Metadata = {
  title: "My Viewing Requests",
  description: "Manage your scheduled and pending room viewing appointments.",
};

export default async function TenantViewingsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.viewings.mine,
      queryFn: () => viewingsService.getMyViewings(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantViewingsView />
    </HydrationBoundary>
  );
}
