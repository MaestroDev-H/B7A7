import type { AdminStats, AuditLog, HttpCaller, Paginated } from "@/lib/api/types";

export const adminService = {
  getStats: (http: HttpCaller): Promise<AdminStats> =>
    http<AdminStats>("/admin/dashboard-stats"),

  getAuditLogs: (
    http: HttpCaller,
    params?: { page?: number; limit?: number; entityType?: string; userId?: string }
  ): Promise<Paginated<AuditLog>> =>
    http<Paginated<AuditLog>>("/admin/audit-logs", { params }),
};
