export { cn } from "cn";

export function getAppUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (rawUrl && !rawUrl.includes("localhost") && !rawUrl.includes("127.0.0.1")) {
    return rawUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "https://b7-a7.vercel.app";
}
