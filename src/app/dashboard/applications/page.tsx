import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Check status of submitted rental applications and tenancy agreements."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Tenant applications table coming together in the next step.
      </div>
    </div>
  );
}
