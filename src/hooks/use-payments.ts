"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import { paymentsService } from "@/lib/api/services/payments";
import { queryKeys } from "@/lib/queries/keys";
import { toast } from "sonner";

export function usePaymentHistory(params?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.payments.history(params),
    queryFn: () => paymentsService.getHistory(clientFetch, params),
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: queryKeys.payments.invoice(invoiceId),
    queryFn: () => paymentsService.getInvoiceById(clientFetch, invoiceId),
    enabled: !!invoiceId,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => paymentsService.initiate(clientFetch, invoiceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.myInvoices });
      if (data?.checkoutUrl && typeof window !== "undefined") {
        window.location.assign(data.checkoutUrl);
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not initiate payment");
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, sessionId }: { invoiceId: string; sessionId?: string }) =>
      paymentsService.verify(clientFetch, invoiceId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.myInvoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenancies.mine });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
