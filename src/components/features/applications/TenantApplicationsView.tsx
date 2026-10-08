"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Search, ExternalLink, Calendar, Building2, Ban, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyApplications, useOptimisticWithdrawApplication } from "@/hooks/use-applications";
import { formatDate } from "@/lib/format";
import type { Application } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export function TenantApplicationsView() {
  const { data: applications = [], isLoading } = useMyApplications();
  const searchParams = useSearchParams();

  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const limit = 10;

  // Optimistic withdraw mutation
  const withdrawMutation = useOptimisticWithdrawApplication(withdrawTargetId || "");

  const handleConfirmWithdraw = async () => {
    if (!withdrawTargetId) return;
    try {
      await withdrawMutation.mutateAsync();
    } finally {
      setWithdrawTargetId(null);
    }
  };

  const filtered = React.useMemo(() => {
    let result = [...applications];

    if (currentStatus && currentStatus !== "ALL") {
      result = result.filter((a) => a.status === currentStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.room?.property?.title?.toLowerCase().includes(q) ||
          a.room?.roomNumber?.toLowerCase().includes(q) ||
          a.message?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [applications, currentStatus, searchTerm]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const columns: ColumnDef<Application>[] = [
    {
      header: "Property & Room",
      cell: (item: Application) => {
        const property = item.room?.property;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                  {property?.title || "Property"}
                </span>
                {item.room?.roomNumber && (
                  <DoorPlate roomNumber={item.room.roomNumber} size="sm" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {property?.city ? `${property.address}, ${property.city}` : "Address not provided"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Desired Move-in",
      cell: (item: Application) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{formatDate(item.moveInDate)}</span>
        </div>
      ),
    },
    {
      header: "Rent / Deposit",
      cell: (item: Application) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">
            {item.room?.rentAmount ? <MoneyText amount={item.room.rentAmount} /> : "—"}/mo
          </div>
          <div className="text-muted-foreground text-[11px]">
            Dep: {item.room?.depositAmount ? <MoneyText amount={item.room.depositAmount} /> : "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: Application) => <StatusBadge status={item.status} />,
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Application) => {
        return (
          <div className="flex items-center justify-end gap-2">
            {item.status === "APPROVED" && (
              <Button
                render={<Link href="/dashboard/tenancies" />}
                variant="outline"
                size="xs"
                className="text-primary border-primary/30 hover:bg-primary/10"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                View Tenancy
              </Button>
            )}

            {item.status === "PENDING" && (
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setWithdrawTargetId(item.id)}
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Withdraw
              </Button>
            )}

            {item.room?.propertyId && (
              <Button
                render={<Link href={`/properties/${item.room.propertyId}`} />}
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="sr-only">View Property</span>
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
        title="Rental Applications"
        description="Monitor status, review approvals, or manage your active lease applications."
        actions={
          <Button render={<Link href="/properties" />} size="sm">
            <Search className="w-4 h-4 mr-1.5" />
            Apply for Rooms
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={currentStatus}
            onValueChange={(val) => {
              if (val) {
                setCurrentStatus(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44 text-xs">
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
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={isLoading}
        keyExtractor={(item: Application) => item.id}
        emptyTitle="No applications found"
        emptyDescription={
          searchTerm || currentStatus !== "ALL"
            ? "No applications match the current search or status filter."
            : "You haven't submitted any rental applications yet."
        }
        emptyAction={{
          label: "Browse Properties",
          href: "/properties",
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

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        open={!!withdrawTargetId}
        onOpenChange={(open) => !open && setWithdrawTargetId(null)}
        title="Withdraw Rental Application?"
        description="Are you sure you want to withdraw this application? The host will be notified that you are no longer applying for this room."
        confirmText="Withdraw Application"
        variant="destructive"
        isLoading={withdrawMutation.isPending}
        onConfirm={handleConfirmWithdraw}
      />
    </div>
  );
}
