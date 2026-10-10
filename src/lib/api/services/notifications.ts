import type { Notification, HttpCaller } from "@/lib/api/types";

export const notificationsService = {
  getAll: (http: HttpCaller, params?: { unread?: boolean }): Promise<Notification[]> =>
    http<Notification[]>("/notifications", { params }),

  markAsRead: (http: HttpCaller, id: string): Promise<Notification> => {
    if (!id) return Promise.reject(new Error("Notification ID is required"));
    return http<Notification>(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllAsRead: (http: HttpCaller): Promise<{ count: number }> =>
    http<{ count: number }>("/notifications/read-all", { method: "PATCH" }),
};
