"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/http.client";
import {
  usersService,
  type UpdateProfileDto,
  type ChangePasswordDto,
} from "@/lib/api/services/users";
import { queryKeys } from "@/lib/queries/keys";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { User, Role } from "@/lib/api/types";
import { toast } from "sonner";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => usersService.getMe(clientFetch),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => usersService.updateMe(clientFetch, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data);
      toast.success("Profile updated");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => usersService.changePassword(clientFetch, dto),
    onSuccess: () => {
      toast.success("Password changed. Please log in again.");
    },
  });
}

export function useAllUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users.all(params),
    queryFn: () => usersService.getAllUsers(clientFetch, params),
  });
}

export function useOptimisticUpdateUserRole(userId: string) {
  return useOptimisticMutation<User, { role: Role }, { previousData: unknown }>({
    mutationFn: ({ role }) => usersService.updateUserRole(clientFetch, userId, role),
    queryKey: queryKeys.users.all(),
    updateFn: (
      old: { data: User[]; meta: { total: number; page: number; totalPages: number } } | undefined,
      { role }
    ) => {
      if (!old || !Array.isArray(old.data)) return old;
      return {
        ...old,
        data: old.data.map((u) => (u.id === userId ? { ...u, role } : u)),
      };
    },
    successMessage: "User role updated",
    invalidateKeys: [queryKeys.users.detail(userId)],
  });
}

export function useDeactivateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => usersService.deactivateUser(clientFetch, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      toast.success("User account deactivated");
    },
  });
}
