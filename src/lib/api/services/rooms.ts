import type { Room, RoomStatus } from "@/lib/api/types";

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
  getAll: <T = { data: Room[]; meta: { total: number; page: number; totalPages: number } }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { page?: number; limit?: number; city?: string; minRent?: number; maxRent?: number; search?: string }
  ): Promise<T> =>
    http("/rooms", { params }),

  getById: <T = Room>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/rooms/${id}`),

  createForProperty: <T = Room>(
    http: (url: string, opts?: unknown) => Promise<T>,
    propertyId: string,
    dto: CreateRoomDto
  ): Promise<T> =>
    http(`/rooms/property/${propertyId}`, { method: "POST", body: JSON.stringify(dto) }),

  update: <T = Room>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    dto: UpdateRoomDto
  ): Promise<T> =>
    http(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),

  delete: <T = { success: boolean; message: string }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/rooms/${id}`, { method: "DELETE" }),
};
