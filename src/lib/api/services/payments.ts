import type { Payment, Invoice } from "@/lib/api/types";

export interface InitiatePaymentResponse {
  checkoutUrl: string;
  sessionId: string;
}

export const paymentsService = {
  initiate: <T = InitiatePaymentResponse>(
    http: (url: string, opts?: unknown) => Promise<T>,
    invoiceId: string
  ): Promise<T> =>
    http("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
    }),

  getHistory: <T = Payment[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: string }
  ): Promise<T> =>
    http("/payments/history", { params }),

  getInvoiceById: <T = Invoice>(
    http: (url: string, opts?: unknown) => Promise<T>,
    invoiceId: string
  ): Promise<T> =>
    http(`/payments/invoices/${invoiceId}`),
};
