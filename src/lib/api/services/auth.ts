import type { User, HttpCaller } from "@/lib/api/types";

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  role: "OWNER" | "TENANT";
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: (http: HttpCaller, dto: LoginDto) =>
    http<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(dto) }),

  register: (http: HttpCaller, dto: RegisterDto) =>
    http<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(dto) }),

  verifyEmail: (http: HttpCaller, dto: { email: string; otp: string }) =>
    http<AuthResponse>("/auth/verify-email", { method: "POST", body: JSON.stringify(dto) }),

  resendOtp: (http: HttpCaller, email: string) =>
    http<{ success: boolean }>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),

  logout: (http: HttpCaller) =>
    http<{ success: boolean }>("/auth/logout", { method: "POST" }),
};
