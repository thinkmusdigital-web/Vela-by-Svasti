import { ROLES, type RoleName } from "@/lib/constants";

export type Permission =
  | "dashboard.view"
  | "rooms.manage"
  | "roomTypes.manage"
  | "gallery.manage"
  | "offers.manage"
  | "content.manage"
  | "users.manage"
  | "settings.manage";

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    "dashboard.view",
    "rooms.manage",
    "roomTypes.manage",
    "gallery.manage",
    "offers.manage",
    "content.manage",
    "users.manage",
    "settings.manage",
  ],
  [ROLES.HOTEL_MANAGER]: [
    "dashboard.view",
    "rooms.manage",
    "roomTypes.manage",
    "offers.manage",
  ],
  // Enquiries are no longer managed in-app (they live in Google Sheets), so
  // these roles now only retain the dashboard landing page.
  [ROLES.RESERVATION_STAFF]: ["dashboard.view"],
  [ROLES.SALES_STAFF]: ["dashboard.view"],
  [ROLES.CONTENT_MANAGER]: [
    "roomTypes.manage",
    "gallery.manage",
    "offers.manage",
    "content.manage",
  ],
};

export interface PermissionUser {
  id?: string;
  role: { name: string };
}

export function can(user: PermissionUser | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  const perms = ROLE_PERMISSIONS[user.role.name as RoleName];
  if (!perms) return false;
  return perms.includes(permission);
}
