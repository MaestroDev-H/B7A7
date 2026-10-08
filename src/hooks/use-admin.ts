"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import { adminService } from "@/lib/api/services/admin";
import { queryKeys } from "@/lib/queries/keys";

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => adminService.getStats(clientFetch),
  });
}

export function useAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  entityType?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(clientFetch, params),
  });
}
