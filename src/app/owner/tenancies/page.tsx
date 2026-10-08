import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerTenanciesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Tenancies &amp; Leases"
        description="Oversee current room leases, generate rent/utility invoices, and manage tenancy closures."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner tenancies table and invoice generation dialogs coming together in the next step.
      </div>
    </div>
  );
}
