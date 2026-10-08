import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerTenanciesView } from "@/components/features/owner/OwnerTenanciesView";

export const metadata: Metadata = {
  title: "Tenancies & Leases",
  description: "Manage resident tenancies, issue rent and utility invoices, and manage lease closures.",
};

export default async function OwnerTenanciesPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.all(),
      queryFn: () => tenanciesService.getAll(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerTenanciesView />
    </HydrationBoundary>
  );
}
