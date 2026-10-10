import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const invoiceId = searchParams.get("invoiceId") || "";

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUrl = new URL("/payment/success", origin);
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
