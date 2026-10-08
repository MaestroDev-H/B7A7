import { PageHeader } from "@/components/shared/PageHeader";

export default function RoomsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Available Rooms"
        description="Search individual rooms with transparent rent, deposit, and roommate compatibility."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Rooms browse discovery coming together in the next step.
      </div>
    </div>
  );
}
