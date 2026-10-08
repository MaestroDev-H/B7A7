import type { Property, PropertyType } from "@/lib/api/types";

export interface PropertyFilterParams {
  page?: number;
  limit?: number;
  city?: string;
  type?: PropertyType | string;
  minRent?: number;
  maxRent?: number;
  search?: string;
  sortBy?: "createdAt" | "title";
  order?: "asc" | "desc";
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  type: PropertyType;
  address: string;
  city: string;
  area?: string;
  amenities: string[];
  images: string[];
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  isPublished?: boolean;
}

export const propertiesService = {
  getAll: <T = { data: Property[]; meta: { total: number; page: number; totalPages: number } }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: PropertyFilterParams
  ): Promise<T> =>
    http("/properties", { params }),

  getById: <T = Property>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/properties/${id}`),

  getMyProperties: <T = Property[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { search?: string; type?: string }
  ): Promise<T> =>
    http("/properties/my-properties", { params }),

  create: <T = Property>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: CreatePropertyDto
  ): Promise<T> =>
    http("/properties", { method: "POST", body: JSON.stringify(dto) }),

  update: <T = Property>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    dto: UpdatePropertyDto
  ): Promise<T> =>
    http(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),

  delete: <T = { success: boolean; message: string }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/properties/${id}`, { method: "DELETE" }),
};
