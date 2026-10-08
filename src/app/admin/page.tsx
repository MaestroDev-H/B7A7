import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { requireRole } from "@/lib/auth/guard";
import { adminService } from "@/lib/api/services/admin";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { AdminOverviewView } from "@/components/features/admin/AdminOverviewView";

export const metadata: Metadata = {
  title: "Admin Console Overview",
  description: "Global system telemetry, platform user roles, and moderation overview.",
};

export default async function AdminPage() {
  await requireRole("ADMIN");

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.admin.stats,
      queryFn: () => adminService.getStats(serverFetch),
    },
    {
      queryKey: queryKeys.admin.auditLogs({ limit: 100 }),
      queryFn: () => adminService.getAuditLogs(serverFetch, { limit: 100 }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminOverviewView />
    </HydrationBoundary>
  );
}
