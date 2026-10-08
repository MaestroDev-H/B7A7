import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query";

/**
 * Creates a server QueryClient with default SSR-friendly stale times
 */
export function createServerQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
      },
    },
  });
}

/**
 * Prefetches one or more queries on the server and returns a dehydrated state
 */
export async function prefetchAndDehydrate(
  queries: Array<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<unknown>;
  }>
): Promise<DehydratedState> {
  const queryClient = createServerQueryClient();

  await Promise.all(
    queries.map(async ({ queryKey, queryFn }) => {
      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn,
        });
      } catch {
        // Tolerant to individual prefetch errors during SSR
      }
    })
  );

  return dehydrate(queryClient);
}
