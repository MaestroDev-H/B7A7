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

export function useOptimisticMarkNotificationRead(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId?: string) => {
      const finalId = targetId || id;
      if (!finalId) return Promise.resolve({} as Notification);
      return notificationsService.markAsRead(clientFetch, finalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
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
