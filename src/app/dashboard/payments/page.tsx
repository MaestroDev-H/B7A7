import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { paymentsService } from "@/lib/api/services/payments";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { PaymentHistoryView } from "@/components/features/payments/PaymentHistoryView";

export const metadata: Metadata = {
  title: "Payment History",
  description: "View your historical rental and utility payment receipts.",
};

export default async function TenantPaymentsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.payments.history(),
      queryFn: () => paymentsService.getHistory(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <PaymentHistoryView />
    </HydrationBoundary>
  );
}
