import type { User, Role } from "@/lib/api/types";

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export const usersService = {
  getMe: <T = User>(http: (url: string, opts?: unknown) => Promise<T>): Promise<T> =>
    http("/users/me"),

  updateMe: <T = User>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: UpdateProfileDto
  ): Promise<T> =>
    http("/users/me", { method: "PATCH", body: JSON.stringify(dto) }),

  changePassword: <T = { success: boolean; message: string }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: ChangePasswordDto
  ): Promise<T> =>
    http("/users/change-password", { method: "POST", body: JSON.stringify(dto) }),

  getAllUsers: <T = { data: User[]; meta: { total: number; page: number; totalPages: number } }>(
    http: (url: string, opts?: unknown) => Promise<T>,
    params?: { page?: number; limit?: number; role?: string; search?: string }
  ): Promise<T> =>
    http("/users", { params }),

  updateUserRole: <T = User>(
    http: (url: string, opts?: unknown) => Promise<T>,
    userId: string,
    role: Role
  ): Promise<T> =>
    http(`/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),

  deactivateUser: <T = User>(
    http: (url: string, opts?: unknown) => Promise<T>,
    userId: string
  ): Promise<T> =>
    http(`/users/${userId}/deactivate`, { method: "PATCH" }),
};
