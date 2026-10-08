"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  roomsService,
  type CreateRoomDto,
  type UpdateRoomDto,
} from "@/lib/api/services/rooms";
import { queryKeys } from "@/lib/queries/keys";
import { toast } from "sonner";

export function useRooms(params?: { page?: number; limit?: number; city?: string; minRent?: number; maxRent?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.rooms.all(params as Record<string, unknown>),
    queryFn: () => roomsService.getAll(clientFetch, params),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(id),
    queryFn: () => roomsService.getById(clientFetch, id),
    enabled: !!id,
  });
}

export function useCreateRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoomDto) =>
      roomsService.createForProperty(clientFetch, propertyId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.my() });
      toast.success("Room added successfully");
    },
  });
}

export function useUpdateRoom(id: string, propertyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateRoomDto) => roomsService.update(clientFetch, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) });
      }
      toast.success("Room updated");
    },
  });
}

export function useDeleteRoom(id: string, propertyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roomsService.delete(clientFetch, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(propertyId) });
      }
      toast.success("Room removed");
    },
  });
}
