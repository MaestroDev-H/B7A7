"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  Calendar,
  User,
  Mail,
  Phone,
  Receipt,
  Plus,
  LogOut,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { GenerateInvoiceDialog } from "@/components/features/owner/GenerateInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenancy, useEndTenancy } from "@/hooks/use-tenancies";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Invoice, Payment, Tenancy } from "@/lib/api/types";
import { toast } from "sonner";

interface OwnerTenancyDetailViewProps {
  tenancyId: string;
}

export function OwnerTenancyDetailView({ tenancyId }: OwnerTenancyDetailViewProps) {
  const { data: tenancy, isLoading } = useTenancy(tenancyId);
  const endTenancyMutation = useEndTenancy(tenancyId);

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [customEndDate, setCustomEndDate] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="h-64 bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!tenancy) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold">Tenancy not found</h3>
        <p className="text-sm text-muted-foreground">The requested tenancy record does not exist or has been removed.</p>
        <Button render={<Link href="/owner/tenancies" />} variant="outline">
          Back to Tenancies
        </Button>
      </div>
    );
  }

  const invoices: Invoice[] = tenancy.invoices || [];

  const handleEndTenancyConfirm = async () => {
    try {
      const endIso = customEndDate ? new Date(customEndDate).toISOString() : undefined;
      await endTenancyMutation.mutateAsync(endIso);
      setEndDialogOpen(false);
      setCustomEndDate("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to end tenancy";
      toast.error(msg);
    }
  };

  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      header: "Invoice Type",
      cell: (item: Invoice) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-xs text-foreground">{item.type}</span>
          {item.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Billed Amount",
      cell: (item: Invoice) => (
        <div className="text-xs font-mono font-bold text-foreground">
          <MoneyText amount={item.amount} />
        </div>
      ),
    },
    {
      header: "Due Date",
      cell: (item: Invoice) => (
        <span className="text-xs font-mono text-foreground">
          {formatDate(item.dueDate)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Invoice) => <StatusBadge status={item.status} />,
    },
    {
      header: "Payment Details",
      cell: (item: Invoice) => {
        const payments: Payment[] = item.payments || [];
        const completedPayment = payments.find((p) => p.status === "SUCCEEDED");

        if (completedPayment) {
          const stripeRef = completedPayment.stripePaymentIntentId || completedPayment.stripeSessionId;
          return (
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Paid <MoneyText amount={completedPayment.amount} /></span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {formatDateTime(completedPayment.createdAt)}
                {stripeRef && (
                  <span className="ml-1 text-[9px] opacity-75">
                    • {stripeRef.slice(-8)}
                  </span>
                )}
              </div>
            </div>
          );
        }

        if (item.status === "PAID") {
          return (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Paid
            </span>
          );
        }

        return (
          <span className="text-xs text-muted-foreground font-mono">
            Unpaid
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/owner/tenancies"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Tenancies
      </Link>

      <PageHeader
        title={`Tenancy #${tenancy.id.slice(-6)}`}
        description={`Lease management for Unit ${tenancy.room?.roomNumber || "N/A"} at ${tenancy.room?.property?.title || "Property"}`}
        actions={
          <div className="flex items-center gap-2">
            {tenancy.status === "ACTIVE" && (
              <>
                <Button size="sm" onClick={() => setInvoiceDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Generate Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setEndDialogOpen(true);
                    setCustomEndDate(new Date().toISOString().split("T")[0] || "");
                  }}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  End Tenancy
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unit & Property */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Rental Unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              {tenancy.room?.roomNumber && (
                <DoorPlate roomNumber={tenancy.room.roomNumber} size="md" />
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">
                  {tenancy.room?.property?.title || "Property Listing"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {tenancy.room?.property?.address || "Address"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t text-xs font-mono flex items-center justify-between">
              <span className="text-muted-foreground">Monthly Rent:</span>
              <span className="font-bold text-foreground">
                <MoneyText amount={tenancy.room?.rentAmount} />
                <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tenant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>{tenancy.tenant?.name || "Resident"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="truncate">{tenancy.tenant?.email || "No email"}</span>
              </div>
              {tenancy.tenant?.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span>{tenancy.tenant.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lease Status & Period */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Lease Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={tenancy.status} />
            </div>
            <div className="space-y-0.5 font-mono pt-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Start Date:</span>
                <span className="text-foreground">{formatDate(tenancy.startDate)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>End Date:</span>
                <span className="text-foreground">
                  {tenancy.endDate ? formatDate(tenancy.endDate) : "Ongoing"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Invoices & Payment Records</h3>
            <p className="text-xs text-muted-foreground">
              Track rent and utility invoices generated for this tenancy and confirm tenant payment statuses.
            </p>
          </div>
          {tenancy.status === "ACTIVE" && (
            <Button size="xs" variant="outline" onClick={() => setInvoiceDialogOpen(true)}>
              <Plus className="w-3 h-3 mr-1" /> New Invoice
            </Button>
          )}
        </div>

        <DataTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(item) => item.id}
          emptyTitle="No invoices generated yet"
          emptyDescription="Click 'Generate Invoice' above to issue rent or utility bills for this tenancy."
        />
      </div>

      {/* Generate Invoice Dialog */}
      <GenerateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        tenancy={tenancy}
      />

      {/* End Tenancy Confirmation Dialog */}
      <ConfirmDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        title="End Resident Tenancy?"
        description={`Concluding this lease for ${tenancy.tenant?.name || "the tenant"} (Unit ${tenancy.room?.roomNumber || ""}) will change status to ENDED and restore room availability.`}
        confirmText="Confirm End Tenancy"
        variant="destructive"
        isLoading={endTenancyMutation.isPending}
        onConfirm={handleEndTenancyConfirm}
      >
        <div className="space-y-1.5 pt-2 text-left">
          <label className="text-xs font-medium text-foreground">Effective End Date (Optional)</label>
          <Input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="text-xs font-mono"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
