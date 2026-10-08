import { PageHeader } from "@/components/shared/PageHeader";

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Platform Services"
        description="Comprehensive solutions for tenants, property hosts, and residential managers."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Services breakdown coming together in the next step.
      </div>
    </div>
  );
}
