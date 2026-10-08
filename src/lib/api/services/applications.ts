import type { Application, ApplicationStatus } from "@/lib/api/types";

export interface CreateApplicationDto {
  roomId: string;
  moveInDate: string;
  message?: string;
}

export const applicationsService = {
  create: <T = Application>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: CreateApplicationDto
  ): Promise<T> =>
    http("/applications", { method: "POST", body: JSON.stringify(dto) }),

  getMyApplications: <T = Application[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/applications/my-applications"),

  getIncoming: <T = Application[]>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { status?: ApplicationStatus }
  ): Promise<T> =>
    http("/applications/incoming", { params }),

  updateStatus: <T = Application>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string,
    status: ApplicationStatus
  ): Promise<T> =>
    http(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  withdraw: <T = Application>(
    http: (url: string, opts?: unknown) => Promise<T>,
    id: string
  ): Promise<T> =>
    http(`/applications/${id}/withdraw`, { method: "PATCH" }),
};
