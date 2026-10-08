import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantInvoicesView } from "@/components/features/invoices/TenantInvoicesView";

export const metadata: Metadata = {
  title: "Invoices & Payments",
  description: "View outstanding rental invoices and initiate secure payments.",
};

export default async function TenantInvoicesPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.myInvoices,
      queryFn: () => tenanciesService.getMyInvoices(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantInvoicesView />
    </HydrationBoundary>
  );
}
