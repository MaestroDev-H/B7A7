import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantRoommatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roommate Matching"
        description="Configure your living preferences and discover compatible housemates."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Roommate preferences and matching tabs coming together in the next step.
      </div>
    </div>
  );
}
