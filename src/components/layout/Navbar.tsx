"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Home, Menu, LayoutDashboard } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout/UserMenu";
import { roleHome } from "@/lib/auth/utils";
import type { User } from "@/lib/api/types";

const PUBLIC_NAV_LINKS = [
  { title: "Properties", href: "/properties" },
  { title: "Rooms", href: "/rooms" },
  { title: "Services", href: "/services" },
  { title: "FAQ", href: "/faq" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

function NavAuthButtons({ user }: { user: User | null }) {
  if (user) {
    const dashboardHref = roleHome(user.role);
    return (
      <div className="flex items-center gap-2.5">
        <Link
          href={dashboardHref}
          className={buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:inline-flex text-xs font-medium" })}
        >
          <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 text-primary" />
          Dashboard
        </Link>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs font-medium" })}
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className={buttonVariants({ variant: "default", size: "sm", className: "text-xs font-medium" })}
      >
        Get Started
      </Link>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Fetch session status from /api/auth/session
  const { data: sessionData } = useQuery<{ user: User | null }>({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 60000,
  });

  const user = sessionData?.user || null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Home className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight leading-none text-foreground">
              Nestly
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Housing &amp; Coliving
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {PUBLIC_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.title}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <div className="h-4 w-px bg-border mx-1" />
          <NavAuthButtons user={user} />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open Navigation Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 flex flex-col justify-between p-6">
              <div className="space-y-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Home className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold text-base">Nestly</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col space-y-3 pt-2">
                  {PUBLIC_NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-sm py-2 px-3 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {link.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-border space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs font-semibold">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href={roleHome(user.role)}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ className: "w-full text-xs" })}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
                      Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ variant: "outline", className: "w-full text-xs" })}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ className: "w-full text-xs" })}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
