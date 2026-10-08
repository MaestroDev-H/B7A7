"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  limit = 10,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= limit)) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = totalItems !== undefined ? Math.min(page * limit, totalItems) : page * limit;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-muted-foreground",
        className
      )}
    >
      <div>
        {totalItems !== undefined ? (
          <span>
            Showing <strong className="text-foreground">{startItem}</strong>–
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{totalItems}</strong> items
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground">{page}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <span className="px-2 text-xs font-medium text-foreground">
          {page} / {Math.max(1, totalPages)}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
