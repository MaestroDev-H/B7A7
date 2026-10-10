import type { User, Role, HttpCaller, Paginated } from "@/lib/api/types";

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
  getMe: (http: HttpCaller): Promise<User> =>
    http<User>("/users/me"),

  updateMe: (http: HttpCaller, dto: UpdateProfileDto): Promise<User> =>
    http<User>("/users/me", { method: "PATCH", body: JSON.stringify(dto) }),

  changePassword: (http: HttpCaller, dto: ChangePasswordDto): Promise<{ success: boolean; message: string }> =>
    http<{ success: boolean; message: string }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  getAllUsers: (
    http: HttpCaller,
    params?: { page?: number; limit?: number; role?: string; search?: string }
  ): Promise<Paginated<User>> =>
    http<Paginated<User>>("/users", { params }),

  updateUserRole: (http: HttpCaller, userId: string, role: Role): Promise<User> =>
    http<User>(`/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),

  deactivateUser: (http: HttpCaller, userId: string): Promise<User> =>
    http<User>(`/users/${userId}`, { method: "DELETE" }),
};
