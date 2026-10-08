import type { Tenancy, Invoice, InvoiceType, HttpCaller } from "@/lib/api/types";

export interface GenerateInvoiceDto {
  type: InvoiceType;
  amount?: number | string;
  dueDate: string;
  description?: string;
}

export const tenanciesService = {
  getMyTenancies: (http: HttpCaller): Promise<Tenancy[]> =>
    http<Tenancy[]>("/tenancies/my-tenancies"),

  getMyInvoices: (http: HttpCaller): Promise<Invoice[]> =>
    http<Invoice[]>("/tenancies/my-invoices"),

  getAll: (http: HttpCaller, params?: { status?: string }): Promise<Tenancy[]> =>
    http<Tenancy[]>("/tenancies", { params }),

  getById: (http: HttpCaller, id: string): Promise<Tenancy> =>
    http<Tenancy>(`/tenancies/${id}`),

  endTenancy: (http: HttpCaller, id: string, endDate?: string): Promise<Tenancy> =>
    http<Tenancy>(`/tenancies/${id}/end`, {
      method: "PATCH",
      body: JSON.stringify(endDate ? { endDate } : {}),
    }),

  generateInvoice: (http: HttpCaller, tenancyId: string, dto: GenerateInvoiceDto): Promise<Invoice> =>
    http<Invoice>(`/tenancies/${tenancyId}/invoices`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
