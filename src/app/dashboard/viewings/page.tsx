import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantViewingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Viewing Requests"
        description="Track and manage your scheduled property tours and viewing dates."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Tenant viewings management table coming together in the next step.
      </div>
    </div>
  );
}
