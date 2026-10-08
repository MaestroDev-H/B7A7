import "server-only";
import { cookies } from "next/headers";
import { ApiError, type FieldError } from "@/lib/api/errors";
import type { ApiResponse, RequestConfig, HttpCaller } from "@/lib/api/types";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export interface ServerRequestOptions extends RequestConfig, Omit<RequestInit, "body" | "headers"> {
  token?: string;
}

export const serverFetch: HttpCaller = async function serverFetch<T>(
  endpoint: string,
  options: ServerRequestOptions = {}
): Promise<T> {
  const { params, token, ...fetchOptions } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const cookieStore = await cookies();
  const accessToken = token || cookieStore.get("accessToken")?.value;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Server request failed with status ${res.status}`;
    const errors: FieldError[] = Array.isArray(data?.errors) ? data.errors : [];
    throw new ApiError(message, res.status, errors, data?.code);
  }

  // If backend wraps in standard ApiResponse envelope
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}
