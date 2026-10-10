import type { ViewingRequest, ViewingStatus, HttpCaller } from "@/lib/api/types";

export interface CreateViewingDto {
  roomId: string;
  requestedDate: string;
  note?: string;
}

export const viewingsService = {
  create: (http: HttpCaller, dto: CreateViewingDto): Promise<ViewingRequest> =>
    http<ViewingRequest>("/viewings", { method: "POST", body: JSON.stringify(dto) }),

  getMyViewings: (http: HttpCaller): Promise<ViewingRequest[]> =>
    http<ViewingRequest[]>("/viewings/my-requests"),

  getIncoming: (http: HttpCaller, params?: { status?: ViewingStatus }): Promise<ViewingRequest[]> =>
    http<ViewingRequest[]>("/viewings/incoming", { params }),

  updateStatus: (http: HttpCaller, id: string, status: ViewingStatus): Promise<ViewingRequest> =>
    http<ViewingRequest>(`/viewings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
