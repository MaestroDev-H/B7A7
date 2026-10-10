import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Bed, SearchX } from "lucide-react";
import * as z from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoomCard } from "@/components/features/rooms/RoomCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Room, Paginated } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Available Rooms",
  description: "Browse verified private and shared rooms available for rent with transparent monthly pricing.",
};

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(12),
  city: z.string().optional(),
});

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const parsed = searchParamsSchema.safeParse(resolvedParams);
  const query = parsed.success ? parsed.data : searchParamsSchema.parse({});

  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.city) params.set("city", query.city);

  let rooms: Room[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const res = await fetch(`${API_BASE_URL}/rooms?${params.toString()}`, {
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const json: {
        success: boolean;
        data: Room[];
        meta?: { total: number; totalPages: number; page: number; limit: number };
      } = await res.json();
      rooms = Array.isArray(json.data) ? json.data : [];
      total = json.meta?.total || rooms.length;
      totalPages = json.meta?.totalPages || 1;
    }
  } catch {
    // Gracefully handle failure
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl">
      <PageHeader
        title="Available Rooms"
        description="Explore individual room units across verified residences. Apply online or schedule an in-person viewing."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Rooms" },
        ]}
      />

      {rooms.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                propertyTitle={room.property?.title || "Residential Property"}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-4 border-t border-border/60">
            <Pagination
              page={query.page}
              limit={query.limit}
              total={total}
              totalPages={totalPages}
            />
          </div>
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-muted/10 space-y-4 max-w-lg mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base">No rooms currently available</h3>
            <p className="text-xs text-muted-foreground">
              All rooms are currently occupied or being prepared. Check our full property listings for upcoming openings.
            </p>
          </div>
          <Link
            href="/properties"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
}
