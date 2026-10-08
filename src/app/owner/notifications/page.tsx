import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { notificationsService } from "@/lib/api/services/notifications";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { NotificationsView } from "@/components/features/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Owner Notifications",
  description: "Stay updated with viewing bookings, tenant applications, and maintenance alerts.",
};

export default async function OwnerNotificationsPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.notifications.all(false),
      queryFn: () => notificationsService.getAll(serverFetch, { unread: false }),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <NotificationsView />
    </HydrationBoundary>
  );
}
