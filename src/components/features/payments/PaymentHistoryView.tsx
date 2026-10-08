"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Calendar, Receipt, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentHistory } from "@/hooks/use-payments";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Succeeded", value: "SUCCEEDED" },
  { label: "Initiated", value: "INITIATED" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

export function PaymentHistoryView() {
  const searchParams = useSearchParams();
  const [currentStatus, setCurrentStatus] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const limit = 10;

  const { data: payments = [], isLoading } = usePaymentHistory(
    currentStatus !== "ALL" ? { status: currentStatus } : undefined
  );

  const totalPages = Math.ceil(payments.length / limit) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return payments.slice(start, start + limit);
  }, [payments, page, limit]);

  const columns: ColumnDef<Payment>[] = [
    {
      header: "Payment Date",
      cell: (item: Payment) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{formatDateTime(item.paidAt || item.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "Invoice Reference",
      cell: (item: Payment) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-foreground">
            {item.invoice?.type || "Rental Payment"}
          </div>
          {item.invoice?.description && (
            <p className="text-[11px] text-muted-foreground">{item.invoice.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Amount Paid",
      cell: (item: Payment) => (
        <span className="font-bold text-sm text-foreground font-mono">
          <MoneyText amount={item.amount} />
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Payment) => <StatusBadge status={item.status} />,
    },
    {
      header: "Stripe Reference",
      cell: (item: Payment) => (
        <span className="text-[11px] font-mono text-muted-foreground">
          {item.stripePaymentIntentId || item.stripeSessionId
            ? `${(item.stripePaymentIntentId || item.stripeSessionId || "").slice(0, 14)}...`
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="Historical log of all Stripe checkout transactions, settled invoices, and receipts."
        actions={
          <Button render={<Link href="/dashboard/invoices" />} size="sm">
            <Receipt className="w-4 h-4 mr-1.5" />
            Open Invoices
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between">
        <Select
          value={currentStatus}
          onValueChange={(val) => {
            if (val) {
              setCurrentStatus(val);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-44 text-xs">
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
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={isLoading}
        keyExtractor={(item: Payment) => item.id}
        emptyTitle="No payment records found"
        emptyDescription="You have not completed any online invoice payments yet."
        emptyAction={{
          label: "View Invoices",
          href: "/dashboard/invoices",
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={payments.length}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
