import { ApiError, type FieldError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";

export interface ClientRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  onProgress?: (percentage: number) => void;
  silent?: boolean;
}

/**
 * Client-side HTTP caller making authenticated proxy requests to Next.js BFF proxy (/api/proxy/*)
 */
export async function clientFetch<T>(
  endpoint: string,
  options: ClientRequestOptions = {}
): Promise<T> {
  const { params, onProgress, ...fetchOptions } = options;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  let url = `/api/proxy/${cleanEndpoint}`;

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

  // Handle FormData upload with XMLHttpRequest to support progress tracking
  if (fetchOptions.body instanceof FormData && onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(fetchOptions.method || "POST", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const responseData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(responseData.data ?? responseData);
          } else {
            if (responseData?.code === "SESSION_EXPIRED" && typeof window !== "undefined") {
              window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
            }
            reject(
              new ApiError(
                responseData?.message || `Upload failed with status ${xhr.status}`,
                xhr.status,
                responseData?.errors || [],
                responseData?.code
              )
            );
          }
        } catch {
          reject(new ApiError("Failed to parse response", xhr.status));
        }
      };

      xhr.onerror = () => reject(new ApiError("Network error during upload", 0));
      xhr.send(fetchOptions.body as FormData);
    });
  }

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    if (data?.code === "SESSION_EXPIRED" && typeof window !== "undefined") {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }

    const message = data?.message || `Request failed with status ${res.status}`;
    const errors: FieldError[] = Array.isArray(data?.errors) ? data.errors : [];
    throw new ApiError(message, res.status, errors, data?.code);
  }

  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}
