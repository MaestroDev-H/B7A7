import { PageHeader } from "@/components/shared/PageHeader";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="About Nestly"
        description="Our mission to simplify boutique co-living and compatible housemate discovery."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        About page coming together in the next step.
      </div>
    </div>
  );
}
