import type { Payment, Invoice, HttpCaller } from "@/lib/api/types";

export interface InitiatePaymentResponse {
  checkoutUrl: string;
  sessionId: string;
}

export const paymentsService = {
  initiate: (http: HttpCaller, invoiceId: string): Promise<InitiatePaymentResponse> =>
    http<InitiatePaymentResponse>("/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
    }),

  getHistory: (http: HttpCaller, params?: { status?: string }): Promise<Payment[]> =>
    http<Payment[]>("/payments/my-payments", { params }),

  getPaymentStatus: (http: HttpCaller, paymentId: string): Promise<Payment> =>
    http<Payment>(`/payments/${paymentId}`),

  getInvoiceById: (http: HttpCaller, invoiceId: string): Promise<Invoice> =>
    http<Invoice>(`/payments/invoices/${invoiceId}`),
};
