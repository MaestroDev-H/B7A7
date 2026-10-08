"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Check,
  Ban,
  Building2,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIncomingViewings, useOptimisticViewingStatus } from "@/hooks/use-viewings";
import { formatDateTime } from "@/lib/format";
import type { ViewingRequest, ViewingStatus } from "@/lib/api/types";

export function OwnerViewingsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusParam = searchParams.get("status") || "ALL";
  const searchParam = searchParams.get("search") || "";
  const propertyParam = searchParams.get("property") || "ALL";

  const { data: viewings = [], isLoading } = useIncomingViewings(
    statusParam !== "ALL" ? { status: statusParam as ViewingStatus } : undefined
  );

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

  // Distinct properties for dropdown filter
  const uniqueProperties = useMemo(() => {
    const map = new Map<string, string>();
    viewings.forEach((v) => {
      const propId = v.propertyId || v.room?.propertyId;
      const propTitle = v.property?.title || v.room?.property?.title;
      if (propId && propTitle && !map.has(propId)) {
        map.set(propId, propTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [viewings]);

  // Filter in-memory for search text & property
  const filteredViewings = useMemo(() => {
    return viewings.filter((v) => {
      if (statusParam !== "ALL" && v.status !== statusParam) return false;

      if (propertyParam !== "ALL") {
        const propId = v.propertyId || v.room?.propertyId;
        if (propId !== propertyParam) return false;
      }

      if (searchParam) {
        const q = searchParam.toLowerCase();
        const tenantName = (v.tenant?.name || "").toLowerCase();
        const tenantEmail = (v.tenant?.email || "").toLowerCase();
        const roomNum = (v.room?.roomNumber || "").toLowerCase();
        const propTitle = (v.property?.title || v.room?.property?.title || "").toLowerCase();
        return (
          tenantName.includes(q) ||
          tenantEmail.includes(q) ||
          roomNum.includes(q) ||
          propTitle.includes(q)
        );
      }

      return true;
    });
  }, [viewings, statusParam, propertyParam, searchParam]);

  const columns: ColumnDef<ViewingRequest>[] = [
    {
      header: "Unit / Property",
      cell: (item: ViewingRequest) => {
        const propTitle = item.property?.title || item.room?.property?.title || "Property Listing";
        return (
          <div className="flex items-center gap-3">
            {item.room?.roomNumber ? (
              <DoorPlate roomNumber={item.room.roomNumber} size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-xs text-foreground truncate max-w-[180px]">{propTitle}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                {item.property?.address || item.room?.property?.address || "Address"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Renter Info",
      cell: (item: ViewingRequest) => (
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
      header: "Requested Schedule",
      cell: (item: ViewingRequest) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <Calendar className="w-3 h-3 text-primary shrink-0" />
            <span>{formatDateTime(item.requestedDate)}</span>
          </div>
          {item.note && (
            <p className="text-[11px] text-muted-foreground italic truncate max-w-[200px]" title={item.note}>
              &ldquo;{item.note}&rdquo;
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: ViewingRequest) => <StatusBadge status={item.status} />,
    },
    {
      header: "",
      className: "text-right",
      cell: (item: ViewingRequest) => <ViewingActionsCell viewing={item} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Viewing Requests"
        description="Review and schedule appointments with prospective tenants exploring your properties."
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search by tenant, email, unit..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Select */}
            <Select value={statusParam} onValueChange={(val) => updateParam("status", val || "ALL")}>
              <SelectTrigger className="w-[140px] text-xs h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Filter */}
            {uniqueProperties.length > 0 && (
              <Select
                value={propertyParam}
                onValueChange={(val) => updateParam("property", val || "ALL")}
              >
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Properties</SelectItem>
                  {uniqueProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredViewings}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyTitle="No viewing requests"
        emptyDescription="When tenants request a tour for one of your rooms, their scheduled visit will appear here."
      />
    </div>
  );
}

function ViewingActionsCell({ viewing }: { viewing: ViewingRequest }) {
  const statusMutation = useOptimisticViewingStatus(viewing.id);

  const handleUpdate = (status: ViewingStatus) => {
    statusMutation.mutate({ status });
  };

  if (viewing.status === "PENDING") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          size="xs"
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px]"
          onClick={() => handleUpdate("APPROVED")}
          disabled={statusMutation.isPending}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="xs"
          className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
          onClick={() => handleUpdate("REJECTED")}
          disabled={statusMutation.isPending}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  if (viewing.status === "APPROVED") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="outline"
          size="xs"
          className="h-7 text-[11px]"
          onClick={() => handleUpdate("COMPLETED")}
          disabled={statusMutation.isPending}
        >
          <Check className="w-3 h-3 mr-1" />
          Mark Done
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground hover:text-destructive h-7 text-[11px]"
          onClick={() => handleUpdate("CANCELLED")}
          disabled={statusMutation.isPending}
        >
          <Ban className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    );
  }

  return <span className="text-[11px] text-muted-foreground italic">No actions</span>;
}
