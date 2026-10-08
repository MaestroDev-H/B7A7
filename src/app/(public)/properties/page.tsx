import { PageHeader } from "@/components/shared/PageHeader";
import { CardGridSkeleton } from "@/components/shared/Skeletons";

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Discover Properties"
        description="Browse verified boutique co-living spaces and apartments across popular cities."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Properties discovery interface coming together in the next step.
      </div>
    </div>
  );
}
