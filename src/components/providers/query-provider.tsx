"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query?.meta?.silent) return;
        // Do not toast for 404 when querying roommates preference
        if (
          error instanceof ApiError &&
          error.status === 404 &&
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "roommates" &&
          query.queryKey[1] === "preference"
        ) {
          return;
        }

        const msg =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "An unexpected error occurred";
        toast.error(msg);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation?.meta?.silent) return;
        const msg =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Action failed";
        toast.error(msg);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min
        gcTime: 5 * 60 * 1000, // 5 mins
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if ([400, 401, 403, 404, 409, 422].includes(error.status)) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
