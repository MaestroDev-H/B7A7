"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  viewingsService,
  type CreateViewingDto,
} from "@/lib/api/services/viewings";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { ViewingRequest, ViewingStatus } from "@/lib/api/types";
import { toast } from "sonner";

export function useMyViewings() {
  return useQuery({
    queryKey: queryKeys.viewings.mine,
    queryFn: () => viewingsService.getMyViewings(clientFetch),
  });
}

export function useIncomingViewings(params?: { status?: ViewingStatus }) {
  return useQuery({
    queryKey: queryKeys.viewings.incoming(params),
    queryFn: () => viewingsService.getIncoming(clientFetch, params),
  });
}

export function useCreateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateViewingDto) => viewingsService.create(clientFetch, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.viewings.mine });
      toast.success("Viewing request submitted");
    },
  });
}

export function useOptimisticViewingStatus(id: string) {
  return useOptimisticMutation<ViewingRequest, { status: ViewingStatus }, ViewingRequest[]>({
    mutationFn: ({ status }) => viewingsService.updateStatus(clientFetch, id, status),
    queryKey: queryKeys.viewings.incoming(),
    updateFn: (old: ViewingRequest[] | undefined, { status }) => {
      if (!Array.isArray(old)) return old;
      return old.map((v) => (v.id === id ? { ...v, status } : v));
    },
    successMessage: "Viewing status updated",
    invalidateKeys: [queryKeys.viewings.mine],
  });
}
