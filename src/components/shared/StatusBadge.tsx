import * as React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Wrench,
  ShieldCheck,
  Building,
  UserCheck,
  Ban,
  RotateCcw,
  CreditCard,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { enumLabel } from "@/lib/format";

export type AnyStatusEnum =
  | "ADMIN"
  | "OWNER"
  | "TENANT"
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "CONDO"
  | "VILLA"
  | "ROOM"
  | "AVAILABLE"
  | "OCCUPIED"
  | "UNDER_MAINTENANCE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "WITHDRAWN"
  | "ACTIVE"
  | "TERMINATED"
  | "EXPIRED"
  | "RENT"
  | "UTILITY"
  | "DEPOSIT"
  | "MAINTENANCE"
  | "OTHER"
  | "PAID"
  | "OVERDUE"
  | "INITIATED"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT"
  | string;

export interface StatusBadgeProps {
  status: AnyStatusEnum;
  className?: string;
  showIcon?: boolean;
}

interface BadgeConfig {
  label?: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

const BADGE_MAP: Record<string, BadgeConfig> = {
  // Roles
  ADMIN: {
    icon: ShieldCheck,
    classes: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
  },
  OWNER: {
    icon: Building,
    classes: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
  },
  TENANT: {
    icon: UserCheck,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },

  // Success / Active
  ACTIVE: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
  AVAILABLE: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
  APPROVED: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
  PAID: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
  SUCCEEDED: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
  RESOLVED: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },

  // Pending / In Progress / Warnings
  PENDING: {
    icon: Clock,
    classes: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  },
  IN_PROGRESS: {
    icon: Clock,
    classes: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  },
  INITIATED: {
    icon: CreditCard,
    classes: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  },
  OPEN: {
    icon: AlertCircle,
    classes: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800",
  },

  // Destructive / Rejected / Overdue / Errors
  REJECTED: {
    icon: XCircle,
    classes: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
  },
  OVERDUE: {
    icon: AlertTriangle,
    classes: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 font-semibold",
  },
  FAILED: {
    icon: XCircle,
    classes: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
  },
  CANCELLED: {
    icon: Ban,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-700",
  },
  WITHDRAWN: {
    icon: RotateCcw,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-700",
  },
  TERMINATED: {
    icon: Ban,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-700",
  },
  EXPIRED: {
    icon: Clock,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-700",
  },
  CLOSED: {
    icon: CheckCircle2,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-700",
  },
  REFUNDED: {
    icon: RotateCcw,
    classes: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800",
  },

  // Priority
  LOW: {
    icon: Clock,
    classes: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700",
  },
  MEDIUM: {
    icon: AlertCircle,
    classes: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  },
  HIGH: {
    icon: AlertTriangle,
    classes: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800",
  },
  URGENT: {
    icon: Flame,
    classes: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 font-bold animate-pulse",
  },

  // Property / Room States
  OCCUPIED: {
    icon: UserCheck,
    classes: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700",
  },
  UNDER_MAINTENANCE: {
    icon: Wrench,
    classes: "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800",
  },
  COMPLETED: {
    icon: CheckCircle2,
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  },
};

/**
 * StatusBadge - Universal status badge ensuring WCAG 4.5:1 contrast in both light and dark themes.
 */
export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();
  const config: BadgeConfig = BADGE_MAP[normalized] ?? {
    icon: AlertCircle,
    classes: "bg-secondary text-secondary-foreground border-border",
  };

  const Icon = config.icon;
  const label = config.label || enumLabel(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border transition-colors shadow-2xs",
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{label}</span>
    </Badge>
  );
}
