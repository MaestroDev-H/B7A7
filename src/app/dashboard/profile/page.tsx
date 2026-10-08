import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile &amp; Security"
        description="Update your personal details, avatar photo, and account security credentials."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Profile and password settings coming together in the next step.
      </div>
    </div>
  );
}
