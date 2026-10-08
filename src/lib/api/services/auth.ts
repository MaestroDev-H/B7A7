import type { User } from "@/lib/api/types";

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
  login: (http: typeof fetch | ((url: string, opts?: any) => Promise<any>), dto: LoginDto) =>
    http("/auth/login", { method: "POST", body: JSON.stringify(dto) }),

  register: (http: typeof fetch | ((url: string, opts?: any) => Promise<any>), dto: RegisterDto) =>
    http("/auth/register", { method: "POST", body: JSON.stringify(dto) }),

  verifyEmail: (
    http: typeof fetch | ((url: string, opts?: any) => Promise<any>),
    dto: { email: string; otp: string }
  ) => http("/auth/verify-email", { method: "POST", body: JSON.stringify(dto) }),

  resendOtp: (http: typeof fetch | ((url: string, opts?: any) => Promise<any>), email: string) =>
    http("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),

  logout: (http: typeof fetch | ((url: string, opts?: any) => Promise<any>)) =>
    http("/auth/logout", { method: "POST" }),
};
