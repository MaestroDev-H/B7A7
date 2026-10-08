"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Search, ExternalLink, Clock, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyViewings } from "@/hooks/use-viewings";
import { formatDateTime } from "@/lib/format";
import type { ViewingRequest } from "@/lib/api/types";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function TenantViewingsView() {
  const { data: viewings = [], isLoading } = useMyViewings();
  const searchParams = useSearchParams();

  const [currentStatus, setCurrentStatus] = React.useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [searchTerm, setSearchTerm] = React.useState<string>(
    searchParams.get("search") || ""
  );
  const [page, setPage] = React.useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const limit = 10;

  // Filter in-memory
  const filtered = React.useMemo(() => {
    let result = [...viewings];

    if (currentStatus && currentStatus !== "ALL") {
      result = result.filter((v) => v.status === currentStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.room?.property?.title?.toLowerCase().includes(q) ||
          v.property?.title?.toLowerCase().includes(q) ||
          v.room?.roomNumber?.toLowerCase().includes(q) ||
          v.note?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [viewings, currentStatus, searchTerm]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const columns: ColumnDef<ViewingRequest>[] = [
    {
      header: "Property & Room",
      cell: (item: ViewingRequest) => {
        const property = item.room?.property || item.property;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
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
      header: "Requested Date",
      cell: (item: ViewingRequest) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{formatDateTime(item.requestedDate)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: ViewingRequest) => <StatusBadge status={item.status} />,
    },
    {
      header: "Note",
      cell: (item: ViewingRequest) => (
        <p className="text-xs text-muted-foreground max-w-[220px] truncate" title={item.note || undefined}>
          {item.note || "—"}
        </p>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (item: ViewingRequest) => {
        const propertyId = item.room?.propertyId || item.propertyId;
        if (!propertyId) return null;
        return (
          <Button
            render={<Link href={`/properties/${propertyId}`} />}
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-foreground"
          >
            Property <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Viewing Requests"
        description="Track and manage your scheduled room viewings with property hosts."
        actions={
          <Button render={<Link href="/properties" />} size="sm">
            <Search className="w-4 h-4 mr-1.5" />
            Find New Rooms
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by property or room..."
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
        keyExtractor={(item: ViewingRequest) => item.id}
        emptyTitle="No viewings found"
        emptyDescription={
          searchTerm || currentStatus !== "ALL"
            ? "No viewing requests match your search filters."
            : "You haven't booked any viewing requests yet. Browse properties to schedule one."
        }
        emptyAction={{
          label: "Explore Rooms",
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
    </div>
  );
}
