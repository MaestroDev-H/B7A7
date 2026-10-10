import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  total?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  total,
  limit = 10,
  onPageChange,
  className,
}: PaginationProps) {
  const count = total !== undefined ? total : totalItems;

  if (totalPages <= 1 && (!count || count <= limit)) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = count !== undefined ? Math.min(page * limit, count) : page * limit;

  const renderNavBtn = (
    targetPage: number,
    disabled: boolean,
    label: string,
    icon: React.ReactNode
  ) => {
    if (disabled) {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8" disabled aria-label={label}>
          {icon}
        </Button>
      );
    }

    if (onPageChange) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(targetPage)}
          aria-label={label}
        >
          {icon}
        </Button>
      );
    }

    return (
      <Link
        href={`?page=${targetPage}`}
        className={buttonVariants({ variant: "outline", size: "icon", className: "h-8 w-8" })}
        aria-label={label}
      >
        {icon}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-muted-foreground",
        className
      )}
    >
      <div>
        {count !== undefined ? (
          <span>
            Showing <strong className="text-foreground">{startItem}</strong>–
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{count}</strong> items
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground">{page}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {renderNavBtn(1, page <= 1, "First page", <ChevronsLeft className="h-3.5 w-3.5" />)}
        {renderNavBtn(page - 1, page <= 1, "Previous page", <ChevronLeft className="h-3.5 w-3.5" />)}

        <span className="px-2 text-xs font-medium text-foreground">
          {page} / {Math.max(1, totalPages)}
        </span>

        {renderNavBtn(page + 1, page >= totalPages, "Next page", <ChevronRight className="h-3.5 w-3.5" />)}
        {renderNavBtn(totalPages, page >= totalPages, "Last page", <ChevronsRight className="h-3.5 w-3.5" />)}
      </div>
    </div>
  );
}
