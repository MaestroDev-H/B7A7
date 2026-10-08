"use client";

import {
  useMutation,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

export interface OptimisticMutationOptions<TMutationData, TVariables, TQueryData, TContext> {
  mutationFn: MutationFunction<TMutationData, TVariables>;
  queryKey: QueryKey;
  updateFn: (oldData: TQueryData | undefined, variables: TVariables) => TQueryData | undefined;
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
  onSuccess?: (data: TMutationData, variables: TVariables, context: TContext | undefined) => void;
}

/**
 * Reusable helper for optimistic mutations with rollback on failure and automatic query invalidation.
 */
export function useOptimisticMutation<
  TMutationData = unknown,
  TVariables = void,
  TQueryData = unknown,
  TContext = { previousData: TQueryData | undefined }
>({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage,
  invalidateKeys = [],
  onSuccess,
}: OptimisticMutationOptions<TMutationData, TVariables, TQueryData, TContext>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TQueryData>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TQueryData>(queryKey, (old: TQueryData | undefined) =>
        updateFn(old, variables)
      );

      return { previousData } as unknown as TContext;
    },
    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context && typeof context === "object" && "previousData" in context) {
        queryClient.setQueryData(
          queryKey,
          (context as { previousData: TQueryData | undefined }).previousData
        );
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
