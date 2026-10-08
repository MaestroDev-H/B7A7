import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantTenanciesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tenancies"
        description="View your active and past lease agreements, unit keys, and rent schedules."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Tenancies list and lease agreements coming together in the next step.
      </div>
    </div>
  );
}
