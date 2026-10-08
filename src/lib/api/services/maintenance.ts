import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from "@/lib/api/types";

export interface CreateMaintenanceDto {
  tenancyId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  images: string[];
}

export const maintenanceService = {
  create: <T = MaintenanceRequest>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: CreateMaintenanceDto
  ): Promise<T> =>
    http("/maintenance", { method: "POST", body: JSON.stringify(dto) }),

  getMyRequests: <T = MaintenanceRequest[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: MaintenanceStatus; priority?: MaintenancePriority }
  ): Promise<T> =>
    http("/maintenance/my-requests", { params }),

  getIncoming: <T = MaintenanceRequest[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: MaintenanceStatus; priority?: MaintenancePriority; propertyId?: string }
  ): Promise<T> =>
    http("/maintenance/incoming", { params }),

  updateStatus: <T = MaintenanceRequest>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    status: MaintenanceStatus
  ): Promise<T> =>
    http(`/maintenance/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
