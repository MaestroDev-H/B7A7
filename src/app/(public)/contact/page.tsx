import { PageHeader } from "@/components/shared/PageHeader";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Contact Us"
        description="Have questions or need assistance with your residence? We're here to help."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Contact form and direct channels coming together in the next step.
      </div>
    </div>
  );
}
