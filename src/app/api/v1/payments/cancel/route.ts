import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const invoiceId = searchParams.get("invoiceId") || "";

  const redirectUrl = new URL("/payment/cancel", req.url);
  if (invoiceId) {
    redirectUrl.searchParams.set("invoiceId", invoiceId);
  }

  // Preserve any additional query params passed by payment providers
  searchParams.forEach((value, key) => {
    if (key !== "invoiceId") {
      redirectUrl.searchParams.set(key, value);
    }
  });

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
