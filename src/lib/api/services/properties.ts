import type { Property, PropertyType, HttpCaller, Paginated } from "@/lib/api/types";

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
  [key: string]: string | number | boolean | undefined;
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
  isPublished?: boolean;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  isPublished?: boolean;
}

export const propertiesService = {
  getAll: (http: HttpCaller, params?: PropertyFilterParams): Promise<Paginated<Property>> =>
    http<Paginated<Property>>("/properties", { params }),

  getById: (http: HttpCaller, id: string): Promise<Property> =>
    http<Property>(`/properties/${id}`),

  getMyProperties: (
    http: HttpCaller,
    params?: { search?: string; type?: string }
  ): Promise<Property[]> =>
    http<Property[]>("/properties/my-properties", { params }),

  create: (http: HttpCaller, dto: CreatePropertyDto): Promise<Property> =>
    http<Property>("/properties", { method: "POST", body: JSON.stringify(dto) }),

  update: (http: HttpCaller, id: string, dto: UpdatePropertyDto): Promise<Property> =>
    http<Property>(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),

  delete: (http: HttpCaller, id: string): Promise<{ success: boolean; message: string }> =>
    http<{ success: boolean; message: string }>(`/properties/${id}`, { method: "DELETE" }),
};
