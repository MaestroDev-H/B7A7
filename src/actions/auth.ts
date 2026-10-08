"use server";

import { redirect } from "next/navigation";
import { setAuthCookies, clearAuthCookies, roleHome, safeNext } from "@/lib/auth/session";
import type { Role, User } from "@/lib/api/types";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export interface AuthActionResult<T = unknown> {
  ok: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
  code?: string;
}

export async function loginAction(
  prevState: unknown,
  formData: FormData | { email: string; password?: string; next?: string }
): Promise<AuthActionResult<{ user: User; redirectUrl: string }>> {
  const email = formData instanceof FormData ? String(formData.get("email") || "") : formData.email;
  const password = formData instanceof FormData ? String(formData.get("password") || "") : formData.password;
  const next = formData instanceof FormData ? String(formData.get("next") || "") : formData.next;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      return {
        ok: false,
        message: body?.message || "Invalid credentials",
        errors: body?.errors || [],
        code: body?.code,
      };
    }

    const { accessToken, refreshToken, user } = body.data;
    await setAuthCookies({ accessToken, refreshToken });

    const targetUrl = safeNext(next) || roleHome(user.role);
    return {
      ok: true,
      data: { user, redirectUrl: targetUrl },
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unable to connect to login service",
    };
  }
}

export async function demoLoginAction(
  role: Role,
  next?: string
): Promise<AuthActionResult<{ user: User; redirectUrl: string }>> {
  const credentialsMap: Record<Role, { email: string; password?: string }> = {
    ADMIN: {
      email: process.env.DEMO_ADMIN_EMAIL || "admin@housing.com",
      password: process.env.DEMO_ADMIN_PASSWORD || "Admin@12345",
    },
    OWNER: {
      email: process.env.DEMO_OWNER_EMAIL || "owner@housing.com",
      password: process.env.DEMO_OWNER_PASSWORD || "Owner@12345",
    },
    TENANT: {
      email: process.env.DEMO_TENANT_EMAIL || "tenant@housing.com",
      password: process.env.DEMO_TENANT_PASSWORD || "Tenant@12345",
    },
  };

  const creds = credentialsMap[role];
  return loginAction(null, { ...creds, next });
}

export async function registerAction(
  prevState: unknown,
  formData: FormData | { name: string; email: string; password?: string; role: "OWNER" | "TENANT"; phone?: string }
): Promise<AuthActionResult<{ email: string }>> {
  const payload =
    formData instanceof FormData
      ? {
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          role: String(formData.get("role") || "TENANT") as "OWNER" | "TENANT",
          phone: String(formData.get("phone") || "") || undefined,
        }
      : formData;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      return {
        ok: false,
        message: body?.message || "Registration failed",
        errors: body?.errors || [],
      };
    }

    return {
      ok: true,
      message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
      data: { email: payload.email },
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unable to connect to registration service",
    };
  }
}

export async function verifyEmailAction(
  email: string,
  otp: string
): Promise<AuthActionResult<{ user: User; redirectUrl: string }>> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      return {
        ok: false,
        message: body?.message || "Invalid or expired verification code",
        errors: body?.errors || [],
      };
    }

    const { accessToken, refreshToken, user } = body.data;
    await setAuthCookies({ accessToken, refreshToken });

    return {
      ok: true,
      message: "Email verified successfully!",
      data: { user, redirectUrl: roleHome(user.role) },
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Verification request failed",
    };
  }
}

export async function resendOtpAction(email: string): Promise<AuthActionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.success) {
      return {
        ok: false,
        message: body?.message || "Failed to resend verification code",
      };
    }

    return { ok: true, message: "A fresh verification code has been sent to your email." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not resend verification code",
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await clearAuthCookies();
  } catch {
    // Ignore cookie clearing error
  }
  redirect("/login");
}
