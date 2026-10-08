import * as React from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MoneyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: string | number | null | undefined;
  period?: "/mo" | "/yr" | "/night" | string;
  showCents?: boolean;
}

/**
 * MoneyText - Decimal-string safe USD renderer.
 * Prevents NaN or raw string rendering of Prisma Decimal fields.
 */
export function MoneyText({
  amount,
  period,
  showCents,
  className,
  ...props
}: MoneyTextProps) {
  const formatted = formatMoney(amount, { showCents });

  return (
    <span className={cn("font-medium tracking-tight", className)} {...props}>
      <span className="font-semibold">{formatted}</span>
      {period && (
        <span className="text-xs text-muted-foreground font-normal ml-0.5">
          {period}
        </span>
      )}
    </span>
  );
}
