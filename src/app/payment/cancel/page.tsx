import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelView } from "@/components/features/payments/PaymentCancelView";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled and no charges were made.",
};

export default function PaymentCancelPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Suspense
        fallback={
          <Card className="max-w-md mx-auto p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-3">Loading details...</p>
          </Card>
        }
      >
        <PaymentCancelView />
      </Suspense>
    </div>
  );
}
