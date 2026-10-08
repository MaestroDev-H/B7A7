"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import { notificationsService } from "@/lib/api/services/notifications";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { Notification } from "@/lib/api/types";
import { toast } from "sonner";

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: queryKeys.notifications.all(unreadOnly),
    queryFn: () => notificationsService.getAll(clientFetch, { unread: unreadOnly }),
    refetchInterval: 60000, // 60s background polling for the notification bell
  });
}

export function useOptimisticMarkNotificationRead(id: string) {
  return useOptimisticMutation<Notification, void, { previousData: unknown }>({
    mutationFn: () => notificationsService.markAsRead(clientFetch, id),
    queryKey: queryKeys.notifications.all(false),
    updateFn: (old: Notification[] | undefined) => {
      if (!Array.isArray(old)) return old;
      return old.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    },
    invalidateKeys: [queryKeys.notifications.all(true)],
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(clientFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });
}
