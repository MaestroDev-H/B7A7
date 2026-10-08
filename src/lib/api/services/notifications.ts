import type { Notification } from "@/lib/api/types";

export const notificationsService = {
  getAll: <T = Notification[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { unread?: boolean }
  ): Promise<T> =>
    http("/notifications", { params }),

  markAsRead: <T = Notification>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllAsRead: <T = { count: number }>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/notifications/read-all", { method: "PATCH" }),
};
