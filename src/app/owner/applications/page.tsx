import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Rental Applications"
        description="Review tenant applications, approve leases, and auto-generate deposit invoices."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner applications review table coming together in the next step.
      </div>
    </div>
  );
}
