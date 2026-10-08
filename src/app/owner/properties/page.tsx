import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerPropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Properties"
        description="Manage your listed residential properties, room inventories, and occupancy rates."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner properties management table coming together in the next step.
      </div>
    </div>
  );
}
