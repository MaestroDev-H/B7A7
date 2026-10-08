import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantMaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance &amp; Repairs"
        description="Submit repair requests with photos and track resolution progress from property hosts."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Tenant maintenance requests coming together in the next step.
      </div>
    </div>
  );
}
