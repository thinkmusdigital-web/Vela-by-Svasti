import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";

export interface AdminNavItem {
  href: string;
  label: string;
  group: string;
  /** Permission required to see the item, or null when visibility is custom. */
  permission: Parameters<typeof can>[1] | null;
  visible: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => boolean;
}

const allow =
  (permission: Parameters<typeof can>[1]) =>
  (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) =>
    can(user, permission);

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    group: "Overview",
    permission: "dashboard.view",
    visible: allow("dashboard.view"),
  },
  {
    href: "/admin/rooms",
    label: "Rooms",
    group: "Content",
    permission: "roomTypes.manage",
    visible: allow("roomTypes.manage"),
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    group: "Content",
    permission: "gallery.manage",
    visible: allow("gallery.manage"),
  },
  {
    href: "/admin/offers",
    label: "Offers",
    group: "Content",
    permission: "offers.manage",
    visible: allow("offers.manage"),
  },
  {
    href: "/admin/content",
    label: "Content",
    group: "Content",
    permission: "content.manage",
    visible: allow("content.manage"),
  },
  {
    href: "/admin/users",
    label: "Users",
    group: "Administration",
    permission: "users.manage",
    visible: allow("users.manage"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    group: "Administration",
    permission: "settings.manage",
    visible: allow("settings.manage"),
  },
];

export type AdminNavFilter = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function navItemsForUser(user: AdminNavFilter) {
  return ADMIN_NAV.filter((item) => item.visible(user));
}