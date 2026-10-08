import {
  QueryClient,
  dehydrate,
  type DehydratedState,
  type FetchQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";

/**
 * Prefetches queries on the server and returns the dehydrated state.
 *
 * Example Usage in Server Component:
 * ```tsx
 * // app/dashboard/page.tsx
 * import { HydrationBoundary } from "@tanstack/react-query";
 * import { prefetchAndDehydrate } from "@/lib/query/prefetch";
 * import { queryKeys } from "@/lib/queries/keys";
 * import { propertiesService } from "@/lib/api/services/properties";
 * import { serverFetch } from "@/lib/api/http.server";
 * import { DashboardContent } from "./dashboard-content";
 *
 * export default async function DashboardPage() {
 *   const dehydratedState = await prefetchAndDehydrate([
 *     {
 *       queryKey: queryKeys.properties.my(),
 *       queryFn: () => propertiesService.getMyProperties(serverFetch),
 *     },
 *   ]);
 *
 *   return (
 *     <HydrationBoundary state={dehydratedState}>
 *       <DashboardContent />
 *     </HydrationBoundary>
 *   );
 * }
 * ```
 */
export async function prefetchAndDehydrate(
  queries: FetchQueryOptions<unknown, Error, unknown, QueryKey>[]
): Promise<DehydratedState> {
  const queryClient = new QueryClient();

  await Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery(query).catch(() => {
        // Silently tolerate prefetch failure so the client can fallback to fetching on mount
      })
    )
  );

  return dehydrate(queryClient);
}
