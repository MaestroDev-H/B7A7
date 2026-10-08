"use client";

import * as React from "react";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Activity,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Shield,
  FileCode,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
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
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { formatDateTime, relativeTime } from "@/lib/format";
import type { AuditLog, Role } from "@/lib/api/types";
import { toast } from "sonner";

export function AdminAuditLogsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const entityTypeParam = searchParams.get("entityType") || "ALL";

  const { data: logsData, isLoading } = useAdminAuditLogs({
    page,
    limit,
    entityType: entityTypeParam !== "ALL" ? entityTypeParam : undefined,
  });

  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Entity ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const logs = logsData?.data || [];
    if (logs.length === 0) {
      toast.warning("No audit logs available to export");
      return;
    }

    const headers = ["Timestamp", "Actor Name", "Actor Role", "Action", "Entity Type", "Entity ID", "Metadata"];
    const rows = logs.map((log) => [
      `"${log.createdAt}"`,
      `"${log.user?.name || "System"}"`,
      `"${log.user?.role || "SYSTEM"}"`,
      `"${log.action}"`,
      `"${log.entityType}"`,
      `"${log.entityId || ""}"`,
      `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nestly_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully");
  };

  const humanizeAction = (action: string) => {
    return action
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      header: "Timestamp",
      cell: (item: AuditLog) => (
        <div className="space-y-0.5 text-xs font-mono" title={formatDateTime(item.createdAt)}>
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Clock className="w-3 h-3 text-primary shrink-0" />
            <span>{relativeTime(item.createdAt)}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">{formatDateTime(item.createdAt)}</div>
        </div>
      ),
    },
    {
      header: "Actor",
      cell: (item: AuditLog) => {
        const role = (item.user?.role || "SYSTEM") as Role | "SYSTEM";
        return (
          <div className="space-y-0.5 text-xs">
            <div className="font-medium text-foreground flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{item.user?.name || "System Automated"}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-muted/30 text-muted-foreground">
              {role}
            </span>
          </div>
        );
      },
    },
    {
      header: "Action",
      cell: (item: AuditLog) => (
        <div className="space-y-0.5">
          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/5">
            {item.action}
          </Badge>
          <p className="text-[11px] text-muted-foreground">{humanizeAction(item.action)}</p>
        </div>
      ),
    },
    {
      header: "Target Entity",
      cell: (item: AuditLog) => (
        <div className="space-y-0.5 text-xs font-mono">
          <span className="font-semibold text-foreground text-[11px]">{item.entityType}</span>
          {item.entityId && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>{item.entityId.slice(-8)}</span>
              <button
                type="button"
                onClick={() => handleCopyId(item.entityId || "")}
                className="hover:text-foreground transition-colors"
                title="Copy Full Entity ID"
              >
                {copiedId === item.entityId ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (item: AuditLog) => {
        const isExpanded = expandedLogIds.has(item.id);
        const hasMeta = item.metadata && Object.keys(item.metadata).length > 0;
        if (!hasMeta) return null;

        return (
          <Button
            variant="ghost"
            size="xs"
            className="h-7 text-[11px]"
            onClick={() => toggleExpand(item.id)}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1" /> Hide Payload
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 mr-1" /> View JSON
              </>
            )}
          </Button>
        );
      },
    },
  ];

  const logs = logsData?.data || [];
  const meta = logsData?.meta || { page, limit, total: logs.length, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Audit Trail"
        description="Immutable log of system modifications, authorization actions, and user security events."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        }
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={entityTypeParam}
              onValueChange={(val) => updateParam("entityType", val || "ALL")}
            >
              <SelectTrigger className="w-[180px] text-xs h-9">
                <SelectValue placeholder="All Entity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entity Types</SelectItem>
                <SelectItem value="USER">User / Auth</SelectItem>
                <SelectItem value="PROPERTY">Property</SelectItem>
                <SelectItem value="ROOM">Room</SelectItem>
                <SelectItem value="APPLICATION">Application</SelectItem>
                <SelectItem value="VIEWING">Viewing</SelectItem>
                <SelectItem value="TENANCY">Tenancy</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs text-muted-foreground font-mono">
            Showing {logs.length} of {meta.total} audit operations
          </span>
        </CardContent>
      </Card>

      {/* Table with expandable metadata rows */}
      <div className="space-y-2">
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyTitle="No audit logs recorded"
          emptyDescription="Platform audit operations will appear here as administrative actions occur."
        />

        {/* Expanded Metadata JSON Cards below table if active */}
        {logs.map((item) => {
          if (!expandedLogIds.has(item.id)) return null;
          return (
            <Card key={`expanded-${item.id}`} className="p-4 bg-muted/40 border-dashed text-xs">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  Audit Payload: {item.action} (#{item.id})
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <pre className="mt-3 p-3 rounded-lg bg-black/90 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                {JSON.stringify(item.metadata, null, 2)}
              </pre>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
}
