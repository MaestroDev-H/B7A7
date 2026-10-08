"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Bell, CheckCheck, Clock, Check, MailOpen, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useNotifications,
  useOptimisticMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/api/types";

export function NotificationsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isUnreadOnly = searchParams.get("unread") === "true";

  const { data: notifications = [], isLoading } = useNotifications(isUnreadOnly);
  const markAllMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const setUnreadFilter = (unread?: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (unread) {
      params.set("unread", "true");
    } else {
      params.delete("unread");
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Notifications"
        description="Stay informed on application updates, viewing confirmations, invoices, and maintenance logs."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs / Toggle */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          variant={!isUnreadOnly ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setUnreadFilter(false)}
          className="text-xs"
        >
          All
        </Button>
        <Button
          variant={isUnreadOnly ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setUnreadFilter(true)}
          className="text-xs"
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse p-4 h-20 bg-muted/40" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-8 border-dashed">
          <EmptyState
            title={isUnreadOnly ? "No unread notifications" : "No notifications yet"}
            description={
              isUnreadOnly
                ? "You have read all your alerts. Switch to All to view past notifications."
                : "You're all caught up! New activity about your bookings and rentals will appear here."
            }
            icon={Bell}
            action={
              isUnreadOnly
                ? {
                    label: "View All Notifications",
                    onClick: () => setUnreadFilter(false),
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <NotificationItem key={item.id} notification={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markReadMutation = useOptimisticMarkNotificationRead(notification.id);

  return (
    <Card
      className={cn(
        "transition-all duration-200 border hover:border-primary/40",
        notification.isRead
          ? "bg-card/50 opacity-85"
          : "bg-primary/5 border-primary/25 shadow-2xs"
      )}
    >
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              notification.isRead
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-xs"
            )}
          >
            {notification.isRead ? (
              <MailOpen className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  "text-sm",
                  notification.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"
                )}
              >
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
              )}
            </div>

            <p className="text-xs text-muted-foreground break-words leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono pt-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatDateTime(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => markReadMutation.mutate()}
            disabled={markReadMutation.isPending}
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
