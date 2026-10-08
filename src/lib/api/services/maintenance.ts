import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
  HttpCaller,
} from "@/lib/api/types";

export interface CreateMaintenanceDto {
  tenancyId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  images: string[];
}

export const maintenanceService = {
  create: (http: HttpCaller, dto: CreateMaintenanceDto): Promise<MaintenanceRequest> =>
    http<MaintenanceRequest>("/maintenance", { method: "POST", body: JSON.stringify(dto) }),

  getMyRequests: (
    http: HttpCaller,
    params?: { status?: MaintenanceStatus; priority?: MaintenancePriority }
  ): Promise<MaintenanceRequest[]> =>
    http<MaintenanceRequest[]>("/maintenance/my-requests", { params }),

  getIncoming: (
    http: HttpCaller,
    params?: { status?: MaintenanceStatus; priority?: MaintenancePriority; propertyId?: string }
  ): Promise<MaintenanceRequest[]> =>
    http<MaintenanceRequest[]>("/maintenance/incoming", { params }),

  updateStatus: (http: HttpCaller, id: string, status: MaintenanceStatus): Promise<MaintenanceRequest> =>
    http<MaintenanceRequest>(`/maintenance/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
