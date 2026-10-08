import { PageHeader } from "@/components/shared/PageHeader";

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Frequently Asked Questions"
        description="Clear answers about viewing requests, lease applications, security deposits, Stripe payments, and maintenance."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        FAQ accordion coming together in the next step.
      </div>
    </div>
  );
}
