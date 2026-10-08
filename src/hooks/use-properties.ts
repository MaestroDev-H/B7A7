"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  propertiesService,
  type PropertyFilterParams,
  type CreatePropertyDto,
  type UpdatePropertyDto,
} from "@/lib/api/services/properties";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { Property } from "@/lib/api/types";
import { toast } from "sonner";

export function useProperties(params?: PropertyFilterParams) {
  return useQuery({
    queryKey: queryKeys.properties.all(params as Record<string, unknown>),
    queryFn: () => propertiesService.getAll(clientFetch, params),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesService.getById(clientFetch, id),
    enabled: !!id,
  });
}

export function useMyProperties(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: queryKeys.properties.my(params),
    queryFn: () => propertiesService.getMyProperties(clientFetch, params),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePropertyDto) => propertiesService.create(clientFetch, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.my() });
      queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      toast.success("Property created successfully");
    },
  });
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePropertyDto) => propertiesService.update(clientFetch, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.my() });
      toast.success("Property updated");
    },
  });
}

export function useOptimisticTogglePublish(id: string) {
  return useOptimisticMutation<Property, { isPublished: boolean }, Property[]>({
    mutationFn: ({ isPublished }) =>
      propertiesService.update(clientFetch, id, { isPublished }),
    queryKey: queryKeys.properties.my(),
    updateFn: (old: Property[] | undefined, { isPublished }) => {
      if (!Array.isArray(old)) return old;
      return old.map((p) => (p.id === id ? { ...p, isPublished } : p));
    },
    successMessage: "Listing status updated",
    invalidateKeys: [queryKeys.properties.detail(id), ["properties", "list"]],
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesService.delete(clientFetch, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.my() });
      queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      toast.success("Property removed");
    },
  });
}
