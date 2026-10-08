import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices &amp; Billing"
        description="View outstanding rent &amp; utility invoices and initiate instant Stripe test payments."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Tenant invoices table and Stripe checkout buttons coming together in the next step.
      </div>
    </div>
  );
}
