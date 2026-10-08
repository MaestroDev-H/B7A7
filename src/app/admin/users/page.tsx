import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Search, view, change roles, and deactivate platform user accounts."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Admin user management table coming together in the next step.
      </div>
    </div>
  );
}
