"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wrench,
  Plus,
  Calendar,
  Building2,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMyMaintenanceRequests } from "@/hooks/use-maintenance";
import { useMyTenancies } from "@/hooks/use-tenancies";
import { NewMaintenanceDialog } from "@/components/features/maintenance/NewMaintenanceDialog";
import { formatDate, formatDateTime } from "@/lib/format";
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "ALL" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

export function TenantMaintenanceView() {
  const searchParams = useSearchParams();
  const [currentStatus, setCurrentStatus] = useState<string>(
    searchParams.get("status") || "ALL"
  );
  const [currentPriority, setCurrentPriority] = useState<string>(
    searchParams.get("priority") || "ALL"
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tenancies = [], isLoading: loadingTenancies } = useMyTenancies();
  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE");
  const hasActiveTenancy = activeTenancies.length > 0;

  const { data: requests = [], isLoading: loadingRequests } = useMyMaintenanceRequests({
    status: currentStatus !== "ALL" ? (currentStatus as MaintenanceStatus) : undefined,
    priority: currentPriority !== "ALL" ? (currentPriority as MaintenancePriority) : undefined,
  });

  const isLoading = loadingTenancies || loadingRequests;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Repairs"
        description="Submit repair tickets for your rented unit and track landlord progress."
        actions={
          hasActiveTenancy ? (
            <Button size="sm" onClick={() => setDialogOpen(true)} className="shadow-xs">
              <Plus className="w-4 h-4 mr-1.5" />
              New Repair Request
            </Button>
          ) : undefined
        }
      />

      {/* No Active Tenancy Warning/EmptyState */}
      {!loadingTenancies && !hasActiveTenancy && (
        <Card className="p-6 border-dashed bg-muted/20">
          <EmptyState
            title="Active tenancy required"
            description="You need an active tenancy lease agreement with Nestly to file maintenance and repair tickets with a landlord."
            icon={Wrench}
            action={{
              label: "Explore Available Rooms",
              href: "/properties",
            }}
            secondaryAction={{
              label: "View Applications",
              href: "/dashboard/applications",
            }}
          />
        </Card>
      )}

      {/* Filter Toolbar */}
      {hasActiveTenancy && (
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={currentStatus}
            onValueChange={(val) => {
              if (val) setCurrentStatus(val);
            }}
          >
            <SelectTrigger className="w-40 text-xs">
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

          <Select
            value={currentPriority}
            onValueChange={(val) => {
              if (val) setCurrentPriority(val);
            }}
          >
            <SelectTrigger className="w-40 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Requests List */}
      {hasActiveTenancy && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse h-36 bg-muted/40" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-8 border-dashed">
              <EmptyState
                title="No maintenance requests"
                description={
                  currentStatus !== "ALL" || currentPriority !== "ALL"
                    ? "No maintenance requests match the selected filters."
                    : "Everything in your home is running smoothly! If you encounter an issue, click 'New Repair Request' above."
                }
                icon={Wrench}
                action={
                  hasActiveTenancy
                    ? {
                        label: "Report New Issue",
                        onClick: () => setDialogOpen(true),
                      }
                    : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((item: MaintenanceRequest) => {
                const property = item.tenancy?.room?.property;
                const room = item.tenancy?.room;

                return (
                  <Card key={item.id} className="border hover:border-primary/40 transition-all shadow-2xs">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base text-foreground font-display">
                              {item.title}
                            </h3>
                            <StatusBadge status={item.status} />
                            <StatusBadge status={item.priority} />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{property?.title || "Rental Property"}</span>
                            {room?.roomNumber && (
                              <DoorPlate roomNumber={room.roomNumber} size="sm" />
                            )}
                            <span>• Reported on {formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg border">
                        {item.description}
                      </p>

                      {/* Attached Photos */}
                      {item.images && item.images.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Attached photos ({item.images.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {item.images.map((imgUrl, idx) => (
                              <a
                                key={idx}
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted/40 hover:opacity-90 transition-opacity"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`Attachment ${idx + 1}`}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* New Request Modal */}
      {hasActiveTenancy && (
        <NewMaintenanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          activeTenancies={activeTenancies}
        />
      )}
    </div>
  );
}
