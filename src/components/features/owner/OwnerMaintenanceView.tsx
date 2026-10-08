"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Wrench,
  AlertCircle,
  Clock,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { ImageFallback } from "@/components/shared/ImageFallback";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useIncomingMaintenanceRequests,
  useOptimisticMaintenanceStatus,
} from "@/hooks/use-maintenance";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from "@/lib/api/types";

const COLUMNS: { status: MaintenanceStatus; label: string; dotColor: string }[] = [
  { status: "OPEN", label: "Open", dotColor: "bg-amber-500" },
  { status: "IN_PROGRESS", label: "In Progress", dotColor: "bg-blue-500" },
  { status: "RESOLVED", label: "Resolved", dotColor: "bg-emerald-500" },
  { status: "CLOSED", label: "Closed", dotColor: "bg-muted-foreground" },
];

export function OwnerMaintenanceView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const priorityParam = searchParams.get("priority") || "ALL";
  const propertyParam = searchParams.get("property") || "ALL";
  const searchParam = searchParams.get("search") || "";

  const { data: tickets = [], isLoading } = useIncomingMaintenanceRequests();

  const [activeMobileTab, setActiveMobileTab] = useState<MaintenanceStatus>("OPEN");
  const [photoViewerTicket, setPhotoViewerTicket] = useState<MaintenanceRequest | null>(null);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  // Distinct properties for dropdown filter
  const uniqueProperties = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => {
      const prop = t.tenancy?.room?.property;
      if (prop?.id && prop?.title && !map.has(prop.id)) {
        map.set(prop.id, prop.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [tickets]);

  // Filter in-memory
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityParam !== "ALL" && t.priority !== priorityParam) return false;

      if (propertyParam !== "ALL") {
        const propId = t.tenancy?.room?.propertyId;
        if (propId !== propertyParam) return false;
      }

      if (searchParam) {
        const q = searchParam.toLowerCase();
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const tenantName = (t.tenancy?.tenant?.name || "").toLowerCase();
        const roomNum = (t.tenancy?.room?.roomNumber || "").toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          tenantName.includes(q) ||
          roomNum.includes(q)
        );
      }

      return true;
    });
  }, [tickets, priorityParam, propertyParam, searchParam]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Repairs"
        description="Track and resolve tenant issue tickets across your properties using this kanban board."
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search by title, description, or unit..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Priority Filter */}
            <Select
              value={priorityParam}
              onValueChange={(val) => updateParam("priority", val || "ALL")}
            >
              <SelectTrigger className="w-[140px] text-xs h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
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

      {/* Mobile Tab View */}
      <div className="block lg:hidden">
        <Tabs
          value={activeMobileTab}
          onValueChange={(v) => setActiveMobileTab(v as MaintenanceStatus)}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 w-full">
            {COLUMNS.map((col) => {
              const count = filteredTickets.filter((t) => t.status === col.status).length;
              return (
                <TabsTrigger key={col.status} value={col.status} className="text-xs">
                  {col.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {COLUMNS.map((col) => {
            const columnTickets = filteredTickets.filter((t) => t.status === col.status);
            return (
              <TabsContent key={col.status} value={col.status} className="space-y-3">
                {columnTickets.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No {col.label.toLowerCase()} tickets.
                  </p>
                ) : (
                  columnTickets.map((ticket) => (
                    <KanbanTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewPhotos={() => setPhotoViewerTicket(ticket)}
                    />
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Desktop Kanban Board (4 Columns) */}
      <div className="hidden lg:grid grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const columnTickets = filteredTickets.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="bg-muted/30 border rounded-xl p-3 space-y-3 min-h-[400px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", col.dotColor)} />
                  <h4 className="font-semibold text-xs text-foreground">{col.label}</h4>
                </div>
                <span className="text-xs font-mono bg-background px-2 py-0.5 rounded-md border font-medium">
                  {columnTickets.length}
                </span>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 flex-1">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-28 bg-muted/60 rounded-lg animate-pulse" />
                    <div className="h-28 bg-muted/60 rounded-lg animate-pulse" />
                  </div>
                ) : columnTickets.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center p-4">
                    <p className="text-[11px] text-muted-foreground">No tickets in this column</p>
                  </div>
                ) : (
                  columnTickets.map((ticket) => (
                    <KanbanTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewPhotos={() => setPhotoViewerTicket(ticket)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photos Modal */}
      {photoViewerTicket && (
        <Dialog open={!!photoViewerTicket} onOpenChange={(open) => !open && setPhotoViewerTicket(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Photos: {photoViewerTicket.title}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-3">
              {photoViewerTicket.images && photoViewerTicket.images.length > 0 ? (
                photoViewerTicket.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-xs text-muted-foreground">
                  No images attached to this ticket.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function KanbanTicketCard({
  ticket,
  onViewPhotos,
}: {
  ticket: MaintenanceRequest;
  onViewPhotos: () => void;
}) {
  const statusMutation = useOptimisticMaintenanceStatus(ticket.id);

  const roomNumber = ticket.tenancy?.room?.roomNumber;
  const propTitle = ticket.tenancy?.room?.property?.title || "Property";
  const tenantName = ticket.tenancy?.tenant?.name || "Tenant";

  const priorityColors: Record<MaintenancePriority, string> = {
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300",
    HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 font-bold",
  };

  return (
    <Card className="bg-card shadow-2xs hover:shadow-xs transition-shadow border text-xs">
      <CardHeader className="p-3 pb-2 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 capitalize", priorityColors[ticket.priority])}
          >
            {ticket.priority.toLowerCase()}
          </Badge>

          {roomNumber && <DoorPlate roomNumber={roomNumber} size="sm" />}
        </div>

        <CardTitle className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
          {ticket.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
          {ticket.description}
        </p>

        {/* Thumbnail Preview */}
        {ticket.images && ticket.images.length > 0 && (
          <button
            type="button"
            onClick={onViewPhotos}
            className="flex items-center gap-1.5 text-[11px] text-primary hover:underline font-medium"
          >
            <ImageIcon className="w-3 h-3" />
            <span>{ticket.images.length} photo{ticket.images.length > 1 ? "s" : ""} attached</span>
          </button>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t space-y-1 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="truncate max-w-[120px]">{propTitle}</span>
            <span className="font-mono">{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-foreground font-medium">
            <User className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>{tenantName}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex items-center justify-between border-t bg-muted/10">
        <span className="text-[10px] text-muted-foreground">Move status:</span>
        <Select
          value={ticket.status}
          onValueChange={(val) => {
            if (val && val !== ticket.status) {
              statusMutation.mutate({ status: val as MaintenanceStatus });
            }
          }}
          disabled={statusMutation.isPending}
        >
          <SelectTrigger className="h-6 text-[10px] w-28 px-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}
