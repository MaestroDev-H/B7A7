import type { Metadata } from "next";
import { fontSans, fontDisplay } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://b7-a7.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Nestly | Housing & Roommate Platform",
    template: "%s | Nestly",
  },
  description:
    "Discover boutique rental homes, find compatible roommates by lifestyle, book viewings, and manage tenancy agreements seamlessly.",
  openGraph: {
    title: "Nestly | Housing & Roommate Platform",
    description:
      "Discover boutique rental homes, find compatible roommates by lifestyle, book viewings, and manage tenancy agreements seamlessly.",
    url: appUrl,
    siteName: "Nestly",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider delay={200}>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
