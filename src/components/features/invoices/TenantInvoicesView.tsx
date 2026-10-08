"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Search, ExternalLink, Calendar, Building2, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyInvoices } from "@/hooks/use-tenancies";
import { useInitiatePayment } from "@/hooks/use-payments";
import { formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Cancelled", value: "CANCELLED" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "Rent", value: "RENT" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Utility", value: "UTILITY" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Other", value: "OTHER" },
];

export function TenantInvoicesView() {
  const { data: invoices = [], isLoading } = useMyInvoices();
  const initiatePaymentMutation = useInitiatePayment();
  const searchParams = useSearchParams();

  const [currentStatus, setCurrentStatus] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [currentType, setCurrentType] = useState<string>(
    searchParams.get("type") || "ALL"
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const limit = 10;

  const showTestHint =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_SHOW_TEST_HINT === "true";

  const filtered = React.useMemo(() => {
    let result = [...invoices];

    if (currentStatus && currentStatus !== "ALL") {
      result = result.filter((i) => i.status === currentStatus);
    }

    if (currentType && currentType !== "ALL") {
      result = result.filter((i) => i.type === currentType);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.tenancy?.room?.property?.title?.toLowerCase().includes(q) ||
          i.tenancy?.room?.roomNumber?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [invoices, currentStatus, currentType, searchTerm]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const columns: ColumnDef<Invoice>[] = [
    {
      header: "Invoice Type & Property",
      cell: (item: Invoice) => {
        const room = item.tenancy?.room;
        const property = room?.property;

        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground">{item.type}</span>
                {room?.roomNumber && <DoorPlate roomNumber={room.roomNumber} size="sm" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {property?.title || "Lease Stay"}
                {item.description ? ` • ${item.description}` : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Amount",
      cell: (item: Invoice) => (
        <div className="font-bold text-sm text-foreground font-mono">
          <MoneyText amount={item.amount} />
        </div>
      ),
    },
    {
      header: "Due Date",
      cell: (item: Invoice) => {
        const isPastDue =
          (item.status === "PENDING" || item.status === "OVERDUE") &&
          new Date(item.dueDate) < new Date();

        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs font-mono text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>{formatDate(item.dueDate)}</span>
            </div>
            {isPastDue && (
              <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (item: Invoice) => <StatusBadge status={item.status} />,
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Invoice) => {
        const canPay = item.status === "PENDING" || item.status === "OVERDUE";

        return (
          <div className="flex items-center justify-end gap-2">
            {canPay && (
              <Button
                size="xs"
                className="bg-primary hover:bg-primary/90 shadow-xs font-semibold"
                onClick={() => initiatePaymentMutation.mutate(item.id)}
                disabled={initiatePaymentMutation.isPending}
              >
                {initiatePaymentMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                <CreditCard className="w-3.5 h-3.5 mr-1" />
                Pay <MoneyText amount={item.amount} />
              </Button>
            )}

            {item.tenancyId && (
              <Button
                render={<Link href={`/dashboard/tenancies/${item.tenancyId}`} />}
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="sr-only">View Tenancy</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Payments"
        description="Review issued rent, security deposits, utilities, and complete online payments with Stripe."
        actions={
          <Button render={<Link href="/dashboard/payments" />} variant="outline" size="sm">
            Payment History
          </Button>
        }
      />

      {/* Stripe Sandbox Test Hint */}
      {showTestHint && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-foreground">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Stripe Sandbox Active:</strong> Use test card{" "}
            <code className="px-1.5 py-0.5 rounded bg-background font-mono font-bold text-primary">
              4242 4242 4242 4242
            </code>{" "}
            with any future expiration date and CVC.
          </span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by property or description..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <Select
            value={currentStatus}
            onValueChange={(val) => {
              if (val) {
                setCurrentStatus(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type filter */}
          <Select
            value={currentType}
            onValueChange={(val) => {
              if (val) {
                setCurrentType(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={isLoading}
        keyExtractor={(item: Invoice) => item.id}
        emptyTitle="No invoices found"
        emptyDescription={
          searchTerm || currentStatus !== "ALL" || currentType !== "ALL"
            ? "No invoices match the current filter criteria."
            : "You do not have any pending or past invoices."
        }
        emptyAction={{
          label: "View My Tenancies",
          href: "/dashboard/tenancies",
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
