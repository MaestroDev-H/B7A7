import type { Room, RoomStatus, HttpCaller, Paginated } from "@/lib/api/types";

export interface CreateRoomDto {
  roomNumber: string;
  capacity: number;
  rentAmount: number | string;
  depositAmount: number | string;
  description?: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  status?: RoomStatus;
}

export const roomsService = {
  getAll: (
    http: HttpCaller,
    params?: { page?: number; limit?: number; city?: string; minRent?: number; maxRent?: number; search?: string }
  ): Promise<Paginated<Room>> =>
    http<Paginated<Room>>("/rooms", { params }),

  getById: (http: HttpCaller, id: string): Promise<Room> =>
    http<Room>(`/rooms/${id}`),

  createForProperty: (http: HttpCaller, propertyId: string, dto: CreateRoomDto): Promise<Room> =>
    http<Room>(`/rooms/property/${propertyId}`, { method: "POST", body: JSON.stringify(dto) }),

  update: (http: HttpCaller, id: string, dto: UpdateRoomDto): Promise<Room> =>
    http<Room>(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),

  delete: (http: HttpCaller, id: string): Promise<{ success: boolean; message: string }> =>
    http<{ success: boolean; message: string }>(`/rooms/${id}`, { method: "DELETE" }),
};
