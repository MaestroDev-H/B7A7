import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="Review all confirmed transactions, Stripe charge IDs, and payment methods."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Payment transaction history coming together in the next step.
      </div>
    </div>
  );
}
