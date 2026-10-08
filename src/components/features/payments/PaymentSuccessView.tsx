"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, ArrowRight, Receipt, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { clientFetch } from "@/lib/api/http.client";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/api/types";

const MAX_POLL_ATTEMPTS = 15; // 15 attempts * 2s = 30s
const POLL_INTERVAL_MS = 2000;

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<"POLLING" | "PAID" | "TIMEOUT" | "ERROR">("POLLING");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [attempts, setAttempts] = useState(0);

  const isPollingRef = useRef(false);

  const checkInvoice = async () => {
    if (!invoiceId) {
      setStatus("ERROR");
      return;
    }

    try {
      const invoices = await tenanciesService.getMyInvoices(clientFetch);
      const found = invoices.find((i) => i.id === invoiceId);

      if (found) {
        setInvoice(found);
        if (found.status === "PAID") {
          setStatus("PAID");
          // Invalidate related cache
          queryClient.invalidateQueries({ queryKey: ["tenancies"] });
          queryClient.invalidateQueries({ queryKey: ["payments"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          return true;
        }
      }
    } catch {
      // Ignore intermediate poll network glitches
    }
    return false;
  };

  useEffect(() => {
    if (!invoiceId) {
      setStatus("ERROR");
      return;
    }

    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const runPoll = async (currentAttempt: number) => {
      if (!isMounted) return;

      const isPaid = await checkInvoice();
      if (isPaid) return;

      if (currentAttempt >= MAX_POLL_ATTEMPTS) {
        if (isMounted) setStatus("TIMEOUT");
        return;
      }

      setAttempts(currentAttempt + 1);
      pollTimer = setTimeout(() => {
        runPoll(currentAttempt + 1);
      }, POLL_INTERVAL_MS);
    };

    runPoll(0);

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
    };
  }, [invoiceId]);

  const handleManualRefresh = async () => {
    setStatus("POLLING");
    setAttempts(0);
    const isPaid = await checkInvoice();
    if (!isPaid) {
      setStatus("TIMEOUT");
    }
  };

  if (status === "ERROR") {
    return (
      <Card className="max-w-md mx-auto my-12 border-destructive/30">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Missing Invoice Information</h2>
          <p className="text-xs text-muted-foreground">
            We could not identify the invoice associated with this payment confirmation session.
          </p>
          <Button render={<Link href="/dashboard/invoices" />} className="w-full">
            Return to Invoices
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "POLLING") {
    const progressPercent = Math.min(100, Math.round((attempts / MAX_POLL_ATTEMPTS) * 100));

    return (
      <Card className="max-w-md mx-auto my-12 shadow-sm">
        <CardContent className="p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground font-display">Confirming Your Payment</h2>
            <p className="text-xs text-muted-foreground">
              Verifying transaction status with Stripe webhook...
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <Progress value={Math.max(10, progressPercent)} className="h-2" />
            <p className="text-[11px] text-muted-foreground font-mono">
              Checking status ({attempts}/{MAX_POLL_ATTEMPTS})
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "TIMEOUT") {
    return (
      <Card className="max-w-md mx-auto my-12 border-amber-500/30">
        <CardContent className="p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground font-display">Payment is Processing</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your transaction was received by Stripe and is being finalized. Your invoice will update shortly.
            </p>
          </div>

          {invoice && (
            <div className="p-3.5 rounded-lg bg-muted/40 border text-xs text-left space-y-1">
              <div className="flex justify-between font-semibold">
                <span>{invoice.type}</span>
                <MoneyText amount={invoice.amount} />
              </div>
              <p className="text-[11px] text-muted-foreground">Due date: {formatDate(invoice.dueDate)}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleManualRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status Again
            </Button>
            <Button render={<Link href="/dashboard/invoices" />} variant="outline" className="w-full">
              Go to Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PAID - Full Success Receipt
  return (
    <Card className="max-w-lg mx-auto my-12 border-emerald-500/30 shadow-md overflow-hidden">
      <div className="bg-emerald-500/10 p-6 text-center border-b border-emerald-500/20">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-display">Payment Successful!</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your payment has been verified and applied to your tenancy account.
        </p>
      </div>

      <CardContent className="p-6 space-y-5 text-xs">
        {invoice && (
          <div className="space-y-3 p-4 rounded-xl bg-card border shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-semibold text-muted-foreground">Receipt Summary</span>
              <StatusBadge status="PAID" />
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="text-base font-bold font-mono text-foreground">
                <MoneyText amount={invoice.amount} />
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Invoice Type</span>
              <span className="font-semibold text-foreground">{invoice.type}</span>
            </div>

            {invoice.tenancy?.room && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Unit / Room</span>
                <DoorPlate roomNumber={invoice.tenancy.room.roomNumber} size="sm" />
              </div>
            )}

            {invoice.description && (
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium text-foreground">{invoice.description}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1 text-muted-foreground text-[11px] pt-2 border-t">
              <span>Verified at</span>
              <span className="font-mono">{formatDate(new Date())}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button render={<Link href="/dashboard/invoices" />} className="w-full">
            <Receipt className="w-4 h-4 mr-2" />
            View Invoices
          </Button>
          <Button render={<Link href="/dashboard" />} variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
