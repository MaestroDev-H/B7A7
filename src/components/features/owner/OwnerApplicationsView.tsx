"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Building2,
  DollarSign,
  AlertCircle,
  MessageSquareQuote,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIncomingApplications, useUpdateApplicationStatus } from "@/hooks/use-applications";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Application, ApplicationStatus } from "@/lib/api/types";
import { toast } from "sonner";

export function OwnerApplicationsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusParam = searchParams.get("status") || "ALL";
  const searchParam = searchParams.get("search") || "";

  const { data: applications = [], isLoading } = useIncomingApplications(
    statusParam !== "ALL" ? { status: statusParam as ApplicationStatus } : undefined
  );

  const [confirmAction, setConfirmAction] = useState<{
    application: Application;
    status: ApplicationStatus;
  } | null>(null);

  const updateStatusMutation = useUpdateApplicationStatus(confirmAction?.application.id || "");

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

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      if (statusParam !== "ALL" && a.status !== statusParam) return false;

      if (searchParam) {
        const q = searchParam.toLowerCase();
        const tenantName = (a.tenant?.name || "").toLowerCase();
        const tenantEmail = (a.tenant?.email || "").toLowerCase();
        const roomNum = (a.room?.roomNumber || "").toLowerCase();
        const propTitle = (a.room?.property?.title || "").toLowerCase();
        return (
          tenantName.includes(q) ||
          tenantEmail.includes(q) ||
          roomNum.includes(q) ||
          propTitle.includes(q)
        );
      }

      return true;
    });
  }, [applications, statusParam, searchParam]);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      await updateStatusMutation.mutateAsync(confirmAction.status);
      setConfirmAction(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update application status";
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Application>[] = [
    {
      header: "Unit / Listing",
      cell: (item: Application) => {
        const room = item.room;
        const propTitle = room?.property?.title || "Property Listing";
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
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                {room?.rentAmount && (
                  <span>
                    <MoneyText amount={room.rentAmount} />
                    <span className="text-[10px] font-normal">/mo</span>
                  </span>
                )}
                {room?.depositAmount && (
                  <span>
                    • Dep: <MoneyText amount={room.depositAmount} />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Applicant Details",
      cell: (item: Application) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground flex items-center gap-1.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span>{item.tenant?.name || "Renter"}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[170px]">{item.tenant?.email || "No email"}</span>
          </div>
          {item.tenant?.phone && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
              <span>{item.tenant.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Move-In & Message",
      cell: (item: Application) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <Calendar className="w-3 h-3 text-primary shrink-0" />
            <span>Move-in: {formatDate(item.moveInDate)}</span>
          </div>
          {item.message && (
            <div className="flex items-start gap-1 text-[11px] text-muted-foreground max-w-[220px]">
              <MessageSquareQuote className="w-3 h-3 shrink-0 mt-0.5" />
              <p className="italic line-clamp-2" title={item.message}>
                &ldquo;{item.message}&rdquo;
              </p>
            </div>
          )}
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
      cell: (item: Application) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status === "PENDING" ? (
            <>
              <Button
                size="xs"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px]"
                onClick={() => setConfirmAction({ application: item, status: "APPROVED" })}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
                onClick={() => setConfirmAction({ application: item, status: "REJECTED" })}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">Processed</span>
          )}
        </div>
      ),
    },
  ];

  const isApprove = confirmAction?.status === "APPROVED";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental Applications"
        description="Review tenant tenancy applications, evaluate qualifications, and approve lease agreements."
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search by applicant, unit, or email..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusParam} onValueChange={(val) => updateParam("status", val || "ALL")}>
              <SelectTrigger className="w-[150px] text-xs h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyTitle="No rental applications"
        emptyDescription="When tenants apply for your listed room units, their applications will appear here for review."
      />

      {/* Approve / Reject Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={isApprove ? "Approve Rental Application?" : "Reject Rental Application?"}
        description={
          isApprove
            ? `Approving ${confirmAction?.application.tenant?.name || "this applicant"}'s application for Unit ${confirmAction?.application.room?.roomNumber || ""} will automatically create an active Tenancy and generate a refundable deposit invoice due in 7 days.`
            : `Are you sure you want to reject this application from ${confirmAction?.application.tenant?.name || "the applicant"}? This cannot be undone.`
        }
        confirmText={isApprove ? "Approve & Create Tenancy" : "Reject Application"}
        variant={isApprove ? "default" : "destructive"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
