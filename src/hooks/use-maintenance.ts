"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  maintenanceService,
  type CreateMaintenanceDto,
} from "@/lib/api/services/maintenance";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from "@/lib/api/types";
import { toast } from "sonner";

export function useMyMaintenanceRequests(params?: {
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
}) {
  return useQuery({
    queryKey: queryKeys.maintenance.mine(params),
    queryFn: () => maintenanceService.getMyRequests(clientFetch, params),
  });
}

export function useIncomingMaintenanceRequests(params?: {
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  propertyId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.maintenance.incoming(params),
    queryFn: () => maintenanceService.getIncoming(clientFetch, params),
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMaintenanceDto) =>
      maintenanceService.create(clientFetch, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.mine() });
      toast.success("Maintenance request submitted");
    },
  });
}

export function useOptimisticMaintenanceStatus(id: string) {
  return useOptimisticMutation<
    MaintenanceRequest,
    { status: MaintenanceStatus },
    { previousData: unknown }
  >({
    mutationFn: ({ status }) =>
      maintenanceService.updateStatus(clientFetch, id, status),
    queryKey: queryKeys.maintenance.incoming(),
    updateFn: (old: MaintenanceRequest[] | undefined, { status }) => {
      if (!Array.isArray(old)) return old;
      return old.map((m) => (m.id === id ? { ...m, status } : m));
    },
    successMessage: "Maintenance status updated",
    invalidateKeys: [queryKeys.maintenance.mine()],
  });
}
