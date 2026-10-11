"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  tenanciesService,
  type GenerateInvoiceDto,
} from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { toast } from "sonner";

export function useMyTenancies() {
  return useQuery({
    queryKey: queryKeys.tenancies.mine,
    queryFn: () => tenanciesService.getMyTenancies(clientFetch),
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: queryKeys.tenancies.myInvoices,
    queryFn: () => tenanciesService.getMyInvoices(clientFetch),
  });
}

export function useAllTenancies(params?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.tenancies.all(params),
    queryFn: () => tenanciesService.getAll(clientFetch, params),
  });
}

export function useTenancy(id: string) {
  return useQuery({
    queryKey: queryKeys.tenancies.detail(id),
    queryFn: () => tenanciesService.getById(clientFetch, id),
    enabled: !!id,
  });
}

export function useEndTenancy(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endDate?: string) => tenanciesService.endTenancy(clientFetch, id, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.mine });
      toast.success("Tenancy ended");
    },
  });
}

export function useGenerateInvoice(tenancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: GenerateInvoiceDto) =>
      tenanciesService.generateInvoice(clientFetch, tenancyId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.detail(tenancyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.myInvoices });
      toast.success("Invoice generated");
    },
  });
}
