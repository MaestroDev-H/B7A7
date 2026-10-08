import type { Application, ApplicationStatus, HttpCaller } from "@/lib/api/types";

export interface CreateApplicationDto {
  roomId: string;
  moveInDate: string;
  message?: string;
}

export const applicationsService = {
  create: (http: HttpCaller, dto: CreateApplicationDto): Promise<Application> =>
    http<Application>("/applications", { method: "POST", body: JSON.stringify(dto) }),

  getMyApplications: (http: HttpCaller): Promise<Application[]> =>
    http<Application[]>("/applications/my-applications"),

  getIncoming: (http: HttpCaller, params?: { status?: ApplicationStatus }): Promise<Application[]> =>
    http<Application[]>("/applications/incoming", { params }),

  updateStatus: (http: HttpCaller, id: string, status: ApplicationStatus): Promise<Application> =>
    http<Application>(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  withdraw: (http: HttpCaller, id: string): Promise<Application> =>
    http<Application>(`/applications/${id}/withdraw`, { method: "PATCH" }),
};
