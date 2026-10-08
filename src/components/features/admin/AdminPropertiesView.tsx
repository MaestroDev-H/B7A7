"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Building2,
  BedDouble,
  ExternalLink,
  EyeOff,
  Trash2,
  Info,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProperties,
  useUpdateProperty,
  useDeleteProperty,
} from "@/hooks/use-properties";
import { formatDate } from "@/lib/format";
import type { Property, PropertyType } from "@/lib/api/types";
import { toast } from "sonner";

export function AdminPropertiesView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const typeParam = searchParams.get("type") || "ALL";
  const cityParam = searchParams.get("city") || "";
  const searchParam = searchParams.get("search") || "";

  const { data: propertiesData, isLoading } = useProperties({
    page,
    limit,
    type: typeParam !== "ALL" ? (typeParam as PropertyType) : undefined,
    city: cityParam || undefined,
    search: searchParam || undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const deleteMutation = useDeleteProperty();

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove listing";
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Property>[] = [
    {
      header: "Property Listing",
      cell: (item: Property) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground truncate max-w-[180px]">{item.title}</p>
            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
              {item.address}, {item.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Host / Owner",
      cell: (item: Property) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground flex items-center gap-1.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span>{item.owner?.name || "Host"}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
            {item.owner?.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      header: "Type & Units",
      cell: (item: Property) => (
        <div className="space-y-0.5 text-xs">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
            {item.type.toLowerCase()}
          </Badge>
          <div className="text-[11px] text-muted-foreground font-mono">
            {item.rooms?.length || 0} unit{(item.rooms?.length || 0) !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Published Date",
      cell: (item: Property) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Property) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            render={<Link href={`/properties/${item.id}`} target="_blank" />}
            variant="ghost"
            size="xs"
            className="h-7 text-[11px]"
            title="Open Public Listing Page"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            View
          </Button>

          <Button
            variant="ghost"
            size="xs"
            className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
            onClick={() => setDeleteTarget(item)}
            title="Delete Listing from Platform"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const properties = propertiesData?.data || [];
  const meta = propertiesData?.meta || { page, limit, total: properties.length, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Moderation"
        description="Oversee active published property listings, enforce safety compliance, and moderate rental content."
      />

      {/* Note about public listings */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          Moderation Directory: Publicly active properties listed across all hosting accounts are surfaced here for moderation.
        </span>
      </div>

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search by title, location..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={typeParam} onValueChange={(val) => updateParam("type", val || "ALL")}>
              <SelectTrigger className="w-[140px] text-xs h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="STUDIO">Studio</SelectItem>
                <SelectItem value="CONDO">Condo</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="ROOM">Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={properties}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyTitle="No properties found"
        emptyDescription="No published properties match your current search filters."
      />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
          totalItems={meta.total}
          limit={meta.limit}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Property Listing?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All associated room units and viewing schedules will also be removed.`}
        confirmText="Delete Property"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
