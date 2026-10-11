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

  verify: (
    http: HttpCaller,
    invoiceId: string,
    sessionId?: string
  ): Promise<{ invoice: Invoice; status: string }> =>
    http<{ invoice: Invoice; status: string }>("/payments/verify", {
      method: "POST",
      body: JSON.stringify({ invoiceId, sessionId }),
    }),

  getHistory: (http: HttpCaller, params?: { status?: string }): Promise<Payment[]> =>
    http<Payment[]>("/payments/my-payments", { params }),

  getPaymentStatus: (http: HttpCaller, paymentId: string): Promise<Payment> =>
    http<Payment>(`/payments/${paymentId}`),

  getInvoiceById: (http: HttpCaller, invoiceId: string): Promise<Invoice> =>
    http<Invoice>(`/payments/invoices/${invoiceId}`),
};
