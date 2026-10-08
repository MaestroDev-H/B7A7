import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs &amp; Activity Trail"
        description="Immutable system audit trail recording platform operations, user actions, and modifications."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Admin audit log table and CSV export coming together in the next step.
      </div>
    </div>
  );
}
