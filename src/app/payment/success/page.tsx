import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessView } from "@/components/features/payments/PaymentSuccessView";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Confirmation",
  description: "Confirming your Stripe payment for tenancy invoice.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Suspense
        fallback={
          <Card className="max-w-md mx-auto p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-3">Loading confirmation...</p>
          </Card>
        }
      >
        <PaymentSuccessView />
      </Suspense>
    </div>
  );
}
