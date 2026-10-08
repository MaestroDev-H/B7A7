import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshSession } from "@/lib/auth/refresh";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const queryString = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}/${targetPath}${queryString}`;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const contentType = req.headers.get("content-type") || "";
  let body: BodyInit | null = null;

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
    } else if (contentType.includes("application/json")) {
      body = await req.text();
    } else {
      const buffer = await req.arrayBuffer();
      if (buffer.byteLength > 0) body = buffer;
    }
  }

  const buildHeaders = (token?: string) => {
    const headers = new Headers();
    if (contentType && !contentType.includes("multipart/form-data")) {
      headers.set("Content-Type", contentType);
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  try {
    let backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: buildHeaders(accessToken),
      body,
      // @ts-expect-error duplex required for streaming bodies in node fetch
      duplex: "half",
    });

    // If 401 Unauthorized, attempt single-flight token refresh and retry once
    if (backendRes.status === 401 && refreshToken) {
      const newTokens = await refreshSession(refreshToken);
      if (newTokens?.accessToken) {
        accessToken = newTokens.accessToken;
        backendRes = await fetch(targetUrl, {
          method: req.method,
          headers: buildHeaders(accessToken),
          body,
          // @ts-expect-error duplex required for streaming bodies in node fetch
          duplex: "half",
        });
      }
    }

    if (backendRes.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired. Please log in again.",
          code: "SESSION_EXPIRED",
        },
        { status: 401 }
      );
    }

    const resContentType = backendRes.headers.get("content-type") || "";
    if (resContentType.includes("application/json")) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }

    const dataBuffer = await backendRes.arrayBuffer();
    return new NextResponse(dataBuffer, {
      status: backendRes.status,
      headers: {
        "Content-Type": resContentType || "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Proxy gateway error",
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
