import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  delta?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  description,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-5 space-y-3", className)}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-36" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/80 bg-card/90 shadow-2xs hover:shadow-md transition-all",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
          {value}
        </div>
        {(delta || description) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {delta && (
              <span
                className={cn(
                  "font-semibold inline-flex items-center",
                  delta.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {delta.isPositive ? "+" : ""}
                {delta.value}
              </span>
            )}
            <span>{delta?.label || description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
