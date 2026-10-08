import {
  LayoutDashboard,
  Eye,
  FileCheck,
  Users,
  Home,
  Receipt,
  CreditCard,
  Wrench,
  Bell,
  User,
  Building2,
  PlusCircle,
  TrendingUp,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/api/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: string;
  exact?: boolean;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
}

export const TENANT_NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Roommates",
        href: "/dashboard/roommates",
        icon: Users,
      },
    ],
  },
  {
    heading: "Applications & Visits",
    items: [
      {
        title: "Viewings",
        href: "/dashboard/viewings",
        icon: Eye,
      },
      {
        title: "Applications",
        href: "/dashboard/applications",
        icon: FileCheck,
      },
    ],
  },
  {
    heading: "Residence & Finance",
    items: [
      {
        title: "Tenancies",
        href: "/dashboard/tenancies",
        icon: Home,
      },
      {
        title: "Invoices",
        href: "/dashboard/invoices",
        icon: Receipt,
      },
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
      },
      {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: Wrench,
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Profile & Settings",
        href: "/dashboard/profile",
        icon: User,
      },
    ],
  },
];

export const OWNER_NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/owner",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Earnings & Analytics",
        href: "/owner/earnings",
        icon: TrendingUp,
      },
    ],
  },
  {
    heading: "Properties & Rooms",
    items: [
      {
        title: "My Properties",
        href: "/owner/properties",
        icon: Building2,
      },
      {
        title: "Add Property",
        href: "/owner/properties/new",
        icon: PlusCircle,
      },
    ],
  },
  {
    heading: "Leasing & Requests",
    items: [
      {
        title: "Viewings",
        href: "/owner/viewings",
        icon: Eye,
      },
      {
        title: "Applications",
        href: "/owner/applications",
        icon: FileCheck,
      },
      {
        title: "Tenancies",
        href: "/owner/tenancies",
        icon: Home,
      },
      {
        title: "Maintenance Board",
        href: "/owner/maintenance",
        icon: Wrench,
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        title: "Notifications",
        href: "/owner/notifications",
        icon: Bell,
      },
      {
        title: "Profile & Settings",
        href: "/owner/profile",
        icon: User,
      },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    heading: "Console",
    items: [
      {
        title: "Platform Stats",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    heading: "Moderation",
    items: [
      {
        title: "Properties",
        href: "/admin/properties",
        icon: Building2,
      },
      {
        title: "Applications",
        href: "/admin/applications",
        icon: FileCheck,
      },
    ],
  },
  {
    heading: "System",
    items: [
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: History,
      },
      {
        title: "Console Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function getNavForRole(role?: Role | null): NavGroup[] {
  switch (role) {
    case "ADMIN":
      return ADMIN_NAV;
    case "OWNER":
      return OWNER_NAV;
    case "TENANT":
    default:
      return TENANT_NAV;
  }
}
