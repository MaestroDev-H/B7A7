import type { AdminStats, AuditLog } from "@/lib/api/types";

export const adminService = {
  getStats: <T = AdminStats>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/admin/dashboard-stats"),

  getAuditLogs: <T = { data: AuditLog[]; meta: { total: number; page: number; totalPages: number } }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { page?: number; limit?: number; entityType?: string; userId?: string }
  ): Promise<T> =>
    http("/admin/audit-logs", { params }),
};
