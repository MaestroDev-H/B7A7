import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings &amp; Info"
        description="Platform version details, administrator profile credentials, and environment parameters."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Admin settings and profile controls coming together in the next step.
      </div>
    </div>
  );
}
