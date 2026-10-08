import type { ViewingRequest, ViewingStatus } from "@/lib/api/types";

export interface CreateViewingDto {
  roomId: string;
  requestedDate: string;
  note?: string;
}

export const viewingsService = {
  create: <T = ViewingRequest>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: CreateViewingDto
  ): Promise<T> =>
    http("/viewings", { method: "POST", body: JSON.stringify(dto) }),

  getMyViewings: <T = ViewingRequest[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/viewings/my-viewings"),

  getIncoming: <T = ViewingRequest[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: ViewingStatus }
  ): Promise<T> =>
    http("/viewings/incoming", { params }),

  updateStatus: <T = ViewingRequest>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    status: ViewingStatus
  ): Promise<T> =>
    http(`/viewings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
