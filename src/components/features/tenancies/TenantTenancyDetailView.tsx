"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTenancy, useEndTenancy } from "@/hooks/use-tenancies";
import { useInitiatePayment } from "@/hooks/use-payments";
import { formatDate, formatDateTime, toISODateTime } from "@/lib/format";
import type { Invoice, Payment } from "@/lib/api/types";

interface TenantTenancyDetailViewProps {
  tenancyId: string;
}

export function TenantTenancyDetailView({ tenancyId }: TenantTenancyDetailViewProps) {
  const router = useRouter();
  const { data: tenancy, isLoading } = useTenancy(tenancyId);
  const endTenancyMutation = useEndTenancy(tenancyId);
  const initiatePaymentMutation = useInitiatePayment();

  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endDateInput, setEndDateInput] = useState("");

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
        <p className="text-sm text-muted-foreground">The requested tenancy agreement could not be loaded.</p>
        <Button render={<Link href="/dashboard/tenancies" />} variant="outline">
          Back to Tenancies
        </Button>
      </div>
    );
  }

  const property = tenancy.room?.property;
  const room = tenancy.room;
  const invoices = tenancy.invoices || [];
  const isActive = tenancy.status === "ACTIVE";

  const handleEndTenancyConfirm = async () => {
    try {
      const isoEndDate = endDateInput ? toISODateTime(endDateInput) : undefined;
      await endTenancyMutation.mutateAsync(isoEndDate);
      setEndDialogOpen(false);
    } catch {
      // Error handled in mutation
    }
  };

  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      header: "Invoice Type",
      cell: (item: Invoice) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-foreground">{item.type}</span>
          {item.description && (
            <p className="text-[11px] text-muted-foreground">{item.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (item: Invoice) => (
        <span className="font-semibold font-mono text-foreground">
          <MoneyText amount={item.amount} />
        </span>
      ),
    },
    {
      header: "Due Date",
      cell: (item: Invoice) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(item.dueDate)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Invoice) => <StatusBadge status={item.status} />,
    },
    {
      header: "Payment History",
      cell: (item: Invoice) => {
        const payments: Payment[] = item.payments || [];
        if (payments.length === 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="space-y-1">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <StatusBadge status={p.status} />
                <span>{formatDate(p.createdAt)}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Invoice) => {
        const canPay = item.status === "PENDING" || item.status === "OVERDUE";
        if (!canPay) return null;

        return (
          <Button
            size="xs"
            onClick={() => initiatePaymentMutation.mutate(item.id)}
            disabled={initiatePaymentMutation.isPending}
            className="shadow-xs bg-primary hover:bg-primary/90"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1" />
            Pay <MoneyText amount={item.amount} />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Back button & Page header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/tenancies"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Tenancies
        </Link>

        <PageHeader
          title={`Tenancy: ${property?.title || "Property"}`}
          description="Detailed contract terms, room specifics, landlord contact, and invoice payments."
          actions={
            isActive ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setEndDialogOpen(true)}
              >
                <Ban className="w-4 h-4 mr-1.5" />
                End Tenancy
              </Button>
            ) : undefined
          }
        />
      </div>

      {/* Tenancy Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Lease Details */}
        <Card className="md:col-span-2 shadow-2xs">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Lease Agreement</CardTitle>
              <StatusBadge status={tenancy.status} />
            </div>
            <CardDescription className="text-xs">
              Agreement initiated on {formatDate(tenancy.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              {room?.roomNumber && <DoorPlate roomNumber={room.roomNumber} size="lg" />}
              <div>
                <h4 className="font-semibold text-sm text-foreground">
                  {property?.title} {room?.roomNumber ? `• Unit ${room.roomNumber}` : ""}
                </h4>
                <p className="text-muted-foreground">
                  {property?.address}, {property?.city} {property?.area ? `(${property.area})` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px]">Monthly Rent</span>
                <p className="font-bold text-base text-foreground font-mono">
                  <MoneyText amount={tenancy.rentAmount} />
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px]">Security Deposit</span>
                <p className="font-bold text-base text-foreground font-mono">
                  <MoneyText amount={tenancy.depositAmount} />
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px]">Start Date</span>
                <p className="font-medium text-foreground font-mono">
                  {formatDate(tenancy.startDate)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px]">End Date</span>
                <p className="font-medium text-foreground font-mono">
                  {tenancy.endDate ? formatDate(tenancy.endDate) : "Ongoing / Open"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Landlord & Property Contacts */}
        <Card className="shadow-2xs">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold">Host Information</CardTitle>
            <CardDescription className="text-xs">Landlord & Property Manager</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {property?.owner?.name ? property.owner.name.charAt(0).toUpperCase() : "H"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {property?.owner?.name || "Property Host"}
                </p>
                <p className="text-muted-foreground text-[11px] truncate">
                  {property?.owner?.email || "Host Verified"}
                </p>
              </div>
            </div>

            {property?.owner?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-mono">{property.owner.phone}</span>
              </div>
            )}

            {property?.id && (
              <div className="pt-2">
                <Button
                  render={<Link href={`/properties/${property.id}`} />}
                  variant="outline"
                  size="xs"
                  className="w-full"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  View Original Listing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenancy Invoices & Payment Schedule */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground">Invoices & Rent Schedule</h3>
          <p className="text-xs text-muted-foreground">
            Invoices issued for rent, deposit, and utilities under this tenancy contract.
          </p>
        </div>

        <DataTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(item) => item.id}
          emptyTitle="No invoices for this tenancy"
          emptyDescription="No invoices have been billed for this lease agreement yet."
        />
      </div>

      {/* End Tenancy Confirmation Dialog */}
      <ConfirmDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        title="End Tenancy Contract?"
        description="Are you sure you want to end this active tenancy? You can optionally set a specific termination date."
        confirmText="Confirm End Tenancy"
        variant="destructive"
        isLoading={endTenancyMutation.isPending}
        onConfirm={handleEndTenancyConfirm}
      >
        <div className="py-2 space-y-1.5 text-left">
          <label className="text-xs font-medium text-foreground">Effective End Date (Optional)</label>
          <Input
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            If left blank, today&apos;s date will be set as the official end date.
          </p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
