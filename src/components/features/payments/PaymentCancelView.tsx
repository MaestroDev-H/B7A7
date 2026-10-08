"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft, ShieldAlert, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/shared/MoneyText";
import { useInvoice, useInitiatePayment } from "@/hooks/use-payments";

export function PaymentCancelView() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const { data: invoice } = useInvoice(invoiceId || "");
  const initiateMutation = useInitiatePayment();

  const handleRetry = () => {
    if (invoiceId) {
      initiateMutation.mutate(invoiceId);
    }
  };

  return (
    <Card className="max-w-md mx-auto my-12 border-border/80 shadow-md overflow-hidden">
      <div className="bg-amber-500/10 p-6 text-center border-b border-amber-500/20">
        <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-display">Payment Cancelled</h2>
        <p className="text-xs text-muted-foreground mt-1">
          No funds were deducted from your card. You can safely try again at any time.
        </p>
      </div>

      <CardContent className="p-6 space-y-5 text-xs">
        {invoice && (
          <div className="p-4 rounded-xl bg-card border space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>{invoice.type} Invoice</span>
              <MoneyText amount={invoice.amount} />
            </div>
            {invoice.description && (
              <p className="text-muted-foreground text-[11px]">{invoice.description}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          {invoiceId && (
            <Button
              onClick={handleRetry}
              disabled={initiateMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Payment Again
            </Button>
          )}
          <Button
            render={<Link href="/dashboard/invoices" />}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
