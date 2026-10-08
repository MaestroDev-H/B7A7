import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Profile &amp; Security"
        description="Update your contact information, host avatar, and account credentials."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner profile and password settings coming together in the next step.
      </div>
    </div>
  );
}
