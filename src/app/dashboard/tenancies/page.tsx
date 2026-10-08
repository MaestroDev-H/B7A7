import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantTenanciesView } from "@/components/features/tenancies/TenantTenanciesView";

export const metadata: Metadata = {
  title: "My Tenancies",
  description: "View your active and past room lease agreements.",
};

export default async function TenantTenanciesPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.mine,
      queryFn: () => tenanciesService.getMyTenancies(serverFetch),
    },
    {
      queryKey: queryKeys.tenancies.myInvoices,
      queryFn: () => tenanciesService.getMyInvoices(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantTenanciesView />
    </HydrationBoundary>
  );
}
