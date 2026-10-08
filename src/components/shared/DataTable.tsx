"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T | string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  /**
   * Title for stacked mobile card representation
   */
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  data: T[] | undefined | null;
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  keyExtractor?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
  skeletonRows?: number;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display at this time.",
  emptyAction,
  keyExtractor,
  onRowClick,
  className,
  skeletonRows = 5,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs", className)}>
        <div className="p-4 space-y-3">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={`sk-${i}`} className="flex items-center gap-4 py-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/6" />
              <Skeleton className="h-5 w-1/5 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop & Tablet Table View (md+) */}
      <div className="hidden md:block rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/70">
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead
                  key={`th-${idx}`}
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => {
              const rowKey = keyExtractor
                ? keyExtractor(row, rowIdx)
                : ((row as Record<string, unknown>).id as string) || rowIdx;

              return (
                <TableRow
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-muted/30 border-b border-border/50 last:border-0",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <TableCell
                      key={`td-${rowKey}-${colIdx}`}
                      className={cn("py-3.5 text-sm", col.className)}
                    >
                      {col.cell(row, rowIdx)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((row, rowIdx) => {
          const rowKey = keyExtractor
            ? keyExtractor(row, rowIdx)
            : ((row as Record<string, unknown>).id as string) || rowIdx;

          return (
            <div
              key={`card-${rowKey}`}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-2.5 transition-all hover:border-primary/40",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, colIdx) => (
                <div
                  key={`mob-col-${colIdx}`}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {col.mobileLabel || (typeof col.header === "string" ? col.header : "")}
                  </span>
                  <div className="text-right">{col.cell(row, rowIdx)}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
