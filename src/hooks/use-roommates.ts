"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  roommatesService,
  type UpdateRoommatePreferenceDto,
} from "@/lib/api/services/roommates";
import { queryKeys } from "@/lib/queries/keys";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

export function useRoommatePreference() {
  return useQuery({
    queryKey: queryKeys.roommates.preference,
    queryFn: async () => {
      try {
        return await roommatesService.getMyPreference(clientFetch);
      } catch (err) {
        // Treat 404 as "no preference set yet", not an error
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useUpdateRoommatePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateRoommatePreferenceDto) =>
      roommatesService.updatePreference(clientFetch, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roommates.preference });
      queryClient.invalidateQueries({ queryKey: queryKeys.roommates.matches });
      queryClient.invalidateQueries({ queryKey: queryKeys.roommates.matchingRooms });
      toast.success("Preferences updated");
    },
  });
}

export function useRoommateMatches(enabled = true) {
  return useQuery({
    queryKey: queryKeys.roommates.matches,
    queryFn: () => roommatesService.getMatches(clientFetch),
    enabled,
    retry: false,
  });
}

export function useMatchingRooms(enabled = true) {
  return useQuery({
    queryKey: queryKeys.roommates.matchingRooms,
    queryFn: () => roommatesService.getMatchingRooms(clientFetch),
    enabled,
    retry: false,
  });
}
