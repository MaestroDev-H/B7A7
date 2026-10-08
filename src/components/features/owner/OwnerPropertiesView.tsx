"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Users,
  DoorClosed,
  Home,
  MapPin,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useMyProperties, useOptimisticTogglePublish, useDeleteProperty } from "@/hooks/use-properties";
import type { Property, PropertyType, Room } from "@/lib/api/types";

const TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "House", value: "HOUSE" },
  { label: "Studio", value: "STUDIO" },
  { label: "Condo", value: "CONDO" },
  { label: "Villa", value: "VILLA" },
  { label: "Room", value: "ROOM" },
];

export function OwnerPropertiesView() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  const [currentType, setCurrentType] = useState<string>(
    searchParams.get("type") || "ALL"
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const limit = 8;

  const { data: properties = [], isLoading } = useMyProperties();
  const deleteMutation = useDeleteProperty();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // In-memory filter & pagination
  const filtered = React.useMemo(() => {
    let result = [...properties];

    if (currentType && currentType !== "ALL") {
      result = result.filter((p) => p.type === currentType);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [properties, currentType, searchTerm]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Properties"
        description="Manage your listed residential properties, room inventories, and publish statuses."
        actions={
          <Button render={<Link href="/owner/properties/new" />} size="sm" className="shadow-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            List New Property
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by title, city or address..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={currentType}
            onValueChange={(val) => {
              if (val) {
                setCurrentType(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-44 text-xs">
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

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-8 border-dashed">
          <EmptyState
            title="List your first property"
            description="You haven't added any real estate properties yet. Use our step-by-step wizard to publish your units and start receiving tenant viewings."
            icon={Building2}
            action={{
              label: "Add Property Now",
              href: "/owner/properties/new",
            }}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 border-dashed">
          <EmptyState
            title="No properties match your filters"
            description="Try clearing search keywords or changing the selected property type."
            icon={Building2}
            action={{
              label: "Reset Filters",
              onClick: () => {
                setSearchTerm("");
                setCurrentType("ALL");
                setPage(1);
              },
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedData.map((property: Property) => (
            <OwnerPropertyCard
              key={property.id}
              property={property}
              onDeleteClick={() => setDeleteTargetId(property.id)}
            />
          ))}
        </div>
      )}

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Property Listing?"
        description="Are you sure you want to permanently remove this property and all associated rooms? This action cannot be undone."
        confirmText="Delete Property"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function OwnerPropertyCard({
  property,
  onDeleteClick,
}: {
  property: Property;
  onDeleteClick: () => void;
}) {
  const togglePublishMutation = useOptimisticTogglePublish(property.id);

  const rooms: Room[] = property.rooms || [];
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupancy = rooms.reduce((sum, r) => sum + (r.currentOccupancy || 0), 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  const coverImage = property.images?.[0] || "/images/placeholder-property.jpg";

  return (
    <Card className="overflow-hidden border hover:border-primary/40 transition-all flex flex-col justify-between shadow-2xs group">
      {/* Cover Image + Badges */}
      <div className="relative aspect-16/9 bg-muted overflow-hidden">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <StatusBadge status={property.type} />
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-xs border shadow-xs ${
              property.isPublished
                ? "bg-emerald-500/90 text-white border-emerald-600"
                : "bg-background/90 text-muted-foreground border-border"
            }`}
          >
            {property.isPublished ? "Published" : "Hidden"}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <CardContent className="p-5 space-y-4 flex-1">
        <div>
          <h3 className="font-bold text-base text-foreground line-clamp-1 font-display">
            {property.title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {property.address}, {property.city}
          </p>
        </div>

        {/* Occupancy Progress */}
        <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span className="font-medium text-foreground">Occupancy</span>
            <span className="font-mono font-semibold">
              {totalOccupancy} / {totalCapacity} beds ({occupancyPercent}%)
            </span>
          </div>
          <Progress value={occupancyPercent} className="h-1.5" />
        </div>

        {/* Room DoorPlates */}
        {rooms.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground">Units ({rooms.length}):</span>
            <div className="flex flex-wrap gap-1.5">
              {rooms.slice(0, 4).map((r) => (
                <DoorPlate key={r.id} roomNumber={r.roomNumber} size="sm" />
              ))}
              {rooms.length > 4 && (
                <span className="text-[11px] text-muted-foreground self-center">
                  +{rooms.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Card Actions Footer */}
      <CardFooter className="p-4 pt-3 border-t bg-muted/10 flex items-center justify-between gap-2">
        <Button
          render={<Link href={`/owner/properties/${property.id}`} />}
          variant="outline"
          size="xs"
          className="flex-1"
        >
          <Settings className="w-3.5 h-3.5 mr-1" />
          Manage
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            togglePublishMutation.mutate({ isPublished: !property.isPublished })
          }
          disabled={togglePublishMutation.isPending}
          title={property.isPublished ? "Hide listing" : "Publish listing"}
        >
          {property.isPublished ? (
            <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-primary" />
          )}
          <span className="sr-only">Toggle publish</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          className="text-destructive hover:bg-destructive/10"
          onClick={onDeleteClick}
          title="Delete property"
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
