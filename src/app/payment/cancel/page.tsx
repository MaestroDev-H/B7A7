import { PageHeader } from "@/components/shared/PageHeader";

export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg space-y-6">
      <PageHeader
        title="Payment Cancelled"
        description="No charges were made to your account."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Payment cancel state and retry flow coming together in Prompt 9.
      </div>
    </div>
  );
}
