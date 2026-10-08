"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  applicationsService,
  type CreateApplicationDto,
} from "@/lib/api/services/applications";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { Application, ApplicationStatus } from "@/lib/api/types";
import { toast } from "sonner";

export function useMyApplications() {
  return useQuery({
    queryKey: queryKeys.applications.mine,
    queryFn: () => applicationsService.getMyApplications(clientFetch),
  });
}

export function useIncomingApplications(params?: { status?: ApplicationStatus }) {
  return useQuery({
    queryKey: queryKeys.applications.incoming(params),
    queryFn: () => applicationsService.getIncoming(clientFetch, params),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApplicationDto) =>
      applicationsService.create(clientFetch, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.mine });
      toast.success("Application submitted successfully");
    },
  });
}

export function useOptimisticWithdrawApplication(id: string) {
  return useOptimisticMutation<Application, void, Application[]>({
    mutationFn: () => applicationsService.withdraw(clientFetch, id),
    queryKey: queryKeys.applications.mine,
    updateFn: (old: Application[] | undefined) => {
      if (!Array.isArray(old)) return old;
      return old.map((app) =>
        app.id === id ? { ...app, status: "WITHDRAWN" as ApplicationStatus } : app
      );
    },
    successMessage: "Application withdrawn",
    invalidateKeys: [queryKeys.applications.incoming()],
  });
}

export function useOptimisticApplicationStatus(id: string) {
  return useOptimisticMutation<Application, { status: ApplicationStatus }, Application[]>({
    mutationFn: ({ status }) => applicationsService.updateStatus(clientFetch, id, status),
    queryKey: queryKeys.applications.incoming(),
    updateFn: (old: Application[] | undefined, { status }) => {
      if (!Array.isArray(old)) return old;
      return old.map((a) => (a.id === id ? { ...a, status } : a));
    },
    successMessage: "Application updated",
    invalidateKeys: [
      queryKeys.applications.mine,
      queryKeys.tenancies.all(),
      queryKeys.tenancies.mine,
      queryKeys.tenancies.myInvoices,
      ["properties"],
      ["rooms"],
    ],
  });
}

export function useUpdateApplicationStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ApplicationStatus) =>
      applicationsService.updateStatus(clientFetch, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.incoming() });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.myInvoices });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Application updated");
    },
  });
}
