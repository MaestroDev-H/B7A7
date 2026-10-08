import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { adminService } from "@/lib/api/services/admin";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { AdminAuditLogsView } from "@/components/features/admin/AdminAuditLogsView";

export const metadata: Metadata = {
  title: "Audit Logs & Activity Trail",
  description: "Track system operations, moderation events, and security access logs.",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; entityType?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const entityType = params.entityType !== "ALL" ? params.entityType : undefined;

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.admin.auditLogs({ page, limit, entityType }),
      queryFn: () => adminService.getAuditLogs(serverFetch, { page, limit, entityType }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminAuditLogsView />
    </HydrationBoundary>
  );
}
