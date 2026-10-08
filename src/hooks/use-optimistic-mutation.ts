"use client";

import {
  useMutation,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

export interface OptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: MutationFunction<TData, TVariables>;
  queryKey: QueryKey;
  updateFn: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
}

/**
 * Reusable helper for optimistic mutations with rollback on failure and automatic query invalidation.
 */
export function useOptimisticMutation<TData = unknown, TVariables = void, TContext = { previousData: unknown }>({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage,
  invalidateKeys = [],
  onSuccess,
}: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: unknown) => updateFn(old, variables));

      return { previousData } as unknown as TContext;
    },
    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context && typeof context === "object" && "previousData" in context) {
        queryClient.setQueryData(queryKey, (context as { previousData: unknown }).previousData);
      }

      const msg = err instanceof ApiError ? err.message : errorMessage || "Action failed";
      toast.error(msg);
    },
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
