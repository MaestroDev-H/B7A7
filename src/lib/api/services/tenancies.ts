import type { Tenancy, Invoice, InvoiceType } from "@/lib/api/types";

export interface GenerateInvoiceDto {
  type: InvoiceType;
  amount?: number | string;
  dueDate: string;
  description?: string;
}

export const tenanciesService = {
  getMyTenancies: <T = Tenancy[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/tenancies/my-tenancies"),

  getMyInvoices: <T = Invoice[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/tenancies/my-invoices"),

  getAll: <T = Tenancy[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: string }
  ): Promise<T> =>
    http("/tenancies", { params }),

  getById: <T = Tenancy>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/tenancies/${id}`),

  endTenancy: <T = Tenancy>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    endDate?: string
  ): Promise<T> =>
    http(`/tenancies/${id}/end`, {
      method: "PATCH",
      body: JSON.stringify(endDate ? { endDate } : {}),
    }),

  generateInvoice: <T = Invoice>(
    http: (url: string, opts?: unknown) => Promise<T>,
    tenancyId: string,
    dto: GenerateInvoiceDto
  ): Promise<T> =>
    http(`/tenancies/${tenancyId}/invoices`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
