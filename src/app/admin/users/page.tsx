import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { usersService } from "@/lib/api/services/users";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { AdminUsersView } from "@/components/features/admin/AdminUsersView";

export const metadata: Metadata = {
  title: "User Management",
  description: "Search platform accounts, configure authorization roles, and manage permissions.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; role?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const role = params.role !== "ALL" ? params.role : undefined;
  const search = params.search || undefined;

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.users.all({ page, limit, role, search }),
      queryFn: () => usersService.getAllUsers(serverFetch, { page, limit, role, search }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminUsersView />
    </HydrationBoundary>
  );
}
