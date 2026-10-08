import { ROLES, type RoleName } from "@/lib/constants";

export type Permission =
  | "dashboard.view"
  | "enquiry.viewAll"
  | "enquiry.viewAssigned"
  | "enquiry.manage"
  | "enquiry.export"
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
    "enquiry.viewAll",
    "enquiry.manage",
    "enquiry.export",
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
    "enquiry.viewAll",
    "enquiry.manage",
    "enquiry.export",
    "rooms.manage",
    "roomTypes.manage",
    "offers.manage",
  ],
  [ROLES.RESERVATION_STAFF]: [
    "dashboard.view",
    "enquiry.viewAll",
    "enquiry.manage",
    "enquiry.export",
  ],
  [ROLES.SALES_STAFF]: ["dashboard.view", "enquiry.viewAssigned", "enquiry.manage"],
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

export interface EnquiryVisibility {
  assignedStaffId: string | null;
}

/**
 * Enquiry visibility rules:
 * - SUPER_ADMIN / HOTEL_MANAGER / RESERVATION_STAFF → every enquiry
 * - SALES_STAFF → only enquiries assigned to them
 * - CONTENT_MANAGER → no enquiry access at all
 */
export function canViewEnquiry(
  user: PermissionUser | null | undefined,
  enquiry: EnquiryVisibility,
): boolean {
  if (!user) return false;
  const roleName = user.role.name;
  if (roleName === ROLES.SUPER_ADMIN || roleName === ROLES.HOTEL_MANAGER || roleName === ROLES.RESERVATION_STAFF) {
    return true;
  }
  if (roleName === ROLES.SALES_STAFF) {
    return enquiry.assignedStaffId !== null && enquiry.assignedStaffId === user.id;
  }
  return false;
}

export function canViewAllEnquiries(user: PermissionUser | null | undefined): boolean {
  return can(user, "enquiry.viewAll");
}
