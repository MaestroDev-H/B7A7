import { PageHeader } from "@/components/shared/PageHeader";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg space-y-6">
      <PageHeader
        title="Payment Confirmation"
        description="Verifying your payment settlement with Stripe..."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Stripe invoice polling and confirmation coming together in Prompt 9.
      </div>
    </div>
  );
}
