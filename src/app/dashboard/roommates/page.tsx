import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { roommatesService } from "@/lib/api/services/roommates";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { RoommatesView } from "@/components/features/roommates/RoommatesView";

export const metadata: Metadata = {
  title: "Roommate Matching",
  description: "Find compatible flatmates and discover rooms matching your lifestyle preferences.",
};

export default async function RoommatesPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.roommates.preference,
      queryFn: async () => {
        try {
          return await roommatesService.getMyPreference(serverFetch);
        } catch {
          return null;
        }
      },
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <RoommatesView />
    </HydrationBoundary>
  );
}
