"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { getNavForRole, type NavGroup } from "@/lib/nav-config";
import type { Role } from "@/lib/api/types";

function getRoleLabel(role?: Role | null) {
  switch (role) {
    case "ADMIN":
      return { title: "Admin Console", badge: "Admin", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" };
    case "OWNER":
      return { title: "Owner Portal", badge: "Owner", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" };
    case "TENANT":
    default:
      return { title: "Tenant Workspace", badge: "Tenant", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
  }
}

function SidebarNav({
  navGroups,
  isCollapsed,
  pathname,
  onItemClick,
}: {
  navGroups: NavGroup[];
  isCollapsed: boolean;
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <div className="space-y-6 py-4">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="px-3">
          {group.heading && !isCollapsed && (
            <h5 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.heading}
            </h5>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    toggleSidebar,
    setMobileSidebarOpen,
  } = useUiStore();

  const navGroups = getNavForRole(role);
  const roleMeta = getRoleLabel(role);

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const formatted = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === pathSegments.length - 1;
    return { href, label: formatted, isLast };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 border-b border-border flex items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Home className="h-4 w-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-base font-bold tracking-tight leading-none truncate">
                    Nestly
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{roleMeta.title}</span>
                </div>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Role Status Tag */}
          {!isSidebarCollapsed && (
            <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">Logged Role</span>
              <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${roleMeta.color}`}>
                {roleMeta.badge}
              </Badge>
            </div>
          )}

          {/* Navigation Links */}
          <ScrollArea className="flex-1">
            <SidebarNav
              navGroups={navGroups}
              isCollapsed={isSidebarCollapsed}
              pathname={pathname}
            />
          </ScrollArea>

          {/* Sidebar Footer Link */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-border">
              <Link
                href="/"
                className="flex items-center justify-between p-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Public Discovery</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile Sheet Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-border text-left">
              <SheetTitle className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-display text-base font-bold">Nestly</span>
                  <p className="text-[11px] text-muted-foreground font-normal">{roleMeta.title}</p>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="px-4 py-2 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Active Role</span>
              <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${roleMeta.color}`}>
                {roleMeta.badge}
              </Badge>
            </div>

            <ScrollArea className="flex-1">
              <SidebarNav
                navGroups={navGroups}
                isCollapsed={false}
                pathname={pathname}
                onItemClick={() => setMobileSidebarOpen(false)}
              />
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Visit Public Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Nestly
                </Link>
                {breadcrumbItems.map((crumb) => (
                  <React.Fragment key={crumb.href}>
                    <span className="text-border">/</span>
                    {crumb.isLast ? (
                      <span className="font-semibold text-foreground">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="hover:text-foreground">
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Topbar Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <NotificationBell />
              <div className="h-4 w-px bg-border mx-1" />
              <UserMenu />
            </div>
          </header>

          {/* Page Content Body */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
