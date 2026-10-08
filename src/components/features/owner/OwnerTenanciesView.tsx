"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  KeyRound,
  Calendar,
  User,
  Mail,
  Receipt,
  Eye,
  LogOut,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { GenerateInvoiceDialog } from "@/components/features/owner/GenerateInvoiceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllTenancies, useEndTenancy } from "@/hooks/use-tenancies";
import { formatDate } from "@/lib/format";
import type { Tenancy } from "@/lib/api/types";
import { toast } from "sonner";

export function OwnerTenanciesView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusParam = searchParams.get("status") || "ALL";
  const searchParam = searchParams.get("search") || "";

  const { data: tenancies = [], isLoading } = useAllTenancies(
    statusParam !== "ALL" ? { status: statusParam } : undefined
  );

  const [invoiceTenancy, setInvoiceTenancy] = useState<Tenancy | null>(null);
  const [endTenancyTarget, setEndTenancyTarget] = useState<Tenancy | null>(null);
  const [customEndDate, setCustomEndDate] = useState("");

  const endTenancyMutation = useEndTenancy(endTenancyTarget?.id || "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const filteredTenancies = useMemo(() => {
    return tenancies.filter((t) => {
      if (statusParam !== "ALL" && t.status !== statusParam) return false;

      if (searchParam) {
        const q = searchParam.toLowerCase();
        const tenantName = (t.tenant?.name || "").toLowerCase();
        const tenantEmail = (t.tenant?.email || "").toLowerCase();
        const roomNum = (t.room?.roomNumber || "").toLowerCase();
        const propTitle = (t.room?.property?.title || "").toLowerCase();
        return (
          tenantName.includes(q) ||
          tenantEmail.includes(q) ||
          roomNum.includes(q) ||
          propTitle.includes(q)
        );
      }

      return true;
    });
  }, [tenancies, statusParam, searchParam]);

  const handleEndTenancyConfirm = async () => {
    if (!endTenancyTarget) return;
    try {
      const endIso = customEndDate ? new Date(customEndDate).toISOString() : undefined;
      await endTenancyMutation.mutateAsync(endIso);
      setEndTenancyTarget(null);
      setCustomEndDate("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to end tenancy";
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Tenancy>[] = [
    {
      header: "Unit / Listing",
      cell: (item: Tenancy) => {
        const room = item.room;
        const propTitle = room?.property?.title || "Property";
        return (
          <div className="flex items-center gap-3">
            {room?.roomNumber ? (
              <DoorPlate roomNumber={room.roomNumber} size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground truncate max-w-[180px]">{propTitle}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                {room?.property?.address || "Address"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Tenant Info",
      cell: (item: Tenancy) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground flex items-center gap-1.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span>{item.tenant?.name || "Tenant"}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[170px]">{item.tenant?.email || "No email"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Monthly Rent",
      cell: (item: Tenancy) => (
        <div className="text-xs font-mono font-bold text-foreground">
          <MoneyText amount={item.room?.rentAmount} />
          <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
        </div>
      ),
    },
    {
      header: "Lease Period",
      cell: (item: Tenancy) => (
        <div className="space-y-0.5 text-xs font-mono">
          <div className="flex items-center gap-1 text-foreground">
            <Calendar className="w-3 h-3 text-primary shrink-0" />
            <span>From: {formatDate(item.startDate)}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {item.endDate ? `To: ${formatDate(item.endDate)}` : "Ongoing active lease"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: Tenancy) => <StatusBadge status={item.status} />,
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Tenancy) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            render={<Link href={`/owner/tenancies/${item.id}`} />}
            variant="ghost"
            size="xs"
            className="h-7 text-[11px]"
            title="View Tenancy & Invoices"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Invoices
          </Button>

          {item.status === "ACTIVE" && (
            <>
              <Button
                variant="outline"
                size="xs"
                className="h-7 text-[11px]"
                onClick={() => setInvoiceTenancy(item)}
                title="Generate Rent or Utility Invoice"
              >
                <Receipt className="w-3.5 h-3.5 mr-1" />
                Bill
              </Button>

              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
                onClick={() => {
                  setEndTenancyTarget(item);
                  setCustomEndDate(new Date().toISOString().split("T")[0] || "");
                }}
                title="End Tenancy"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                End
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenancy Leases"
        description="Monitor active resident tenancies, issue rent & utility invoices, and oversee lease agreements."
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search by tenant, unit, or email..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusParam} onValueChange={(val) => updateParam("status", val || "ALL")}>
              <SelectTrigger className="w-[150px] text-xs h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ENDED">Ended</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTenancies}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyTitle="No tenancies found"
        emptyDescription="When applications are approved, active tenancies and room allocations will appear here."
      />

      {/* Generate Invoice Dialog */}
      <GenerateInvoiceDialog
        open={!!invoiceTenancy}
        onOpenChange={(open) => !open && setInvoiceTenancy(null)}
        tenancy={invoiceTenancy}
      />

      {/* End Tenancy Confirmation Dialog */}
      <ConfirmDialog
        open={!!endTenancyTarget}
        onOpenChange={(open) => !open && setEndTenancyTarget(null)}
        title="End Resident Tenancy?"
        description={`Ending the tenancy for ${endTenancyTarget?.tenant?.name || "this tenant"} (Unit ${endTenancyTarget?.room?.roomNumber || ""}) will conclude their active occupancy and free up room capacity.`}
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
