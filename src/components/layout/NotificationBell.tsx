"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  CreditCard,
  ExternalLink,
  Loader2,
  Home,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useOptimisticMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { relativeTime } from "@/lib/format";
import type { Notification, NotificationType } from "@/lib/api/types";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "VIEWING":
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case "APPLICATION":
      return <FileCheck className="h-4 w-4 text-emerald-500" />;
    case "TENANCY":
      return <Home className="h-4 w-4 text-indigo-500" />;
    case "INVOICE":
    case "PAYMENT":
      return <CreditCard className="h-4 w-4 text-amber-500" />;
    case "MAINTENANCE":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "SYSTEM":
    default:
      return <Info className="h-4 w-4 text-purple-500" />;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const { role, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Poll unread notifications every 60s
  const { data: notifications = [], isLoading } = useNotifications(true);

  const markOneMutation = useOptimisticMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications.length;

  const handleMarkAll = async () => {
    try {
      await markAllMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleItemClick = (notif: Notification) => {
    if (!notif.isRead && notif.id) {
      markOneMutation.mutate(notif.id);
    }
    setIsOpen(false);
    const link =
      typeof notif.data === "object" && notif.data && "link" in notif.data
        ? String(notif.data.link)
        : undefined;

    if (link) {
      router.push(link);
    }
  };

  const notificationsRoute =
    role === "OWNER" ? "/owner/notifications" : "/dashboard/notifications";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-muted-foreground hover:text-foreground"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 h-7"
              onClick={handleMarkAll}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No unread notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif: Notification) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notif.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-background border border-border shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium leading-snug line-clamp-1">{notif.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      {relativeTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {!isAdmin && (
          <div className="p-2.5 border-t border-border bg-muted/20 text-center">
            <Link
              href={notificationsRoute}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              View all notifications
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
