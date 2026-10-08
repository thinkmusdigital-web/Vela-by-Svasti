import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { can, type Permission } from "@/lib/rbac";

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type GuardResult =
  | { user: AdminUser; error: null; reason: null }
  | { user: null; error: 401 | 403; reason: string };

export async function requireAnyPermission(permissions: Permission[]): Promise<GuardResult> {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: 401, reason: "Unauthorized" };
  if (!permissions.some((permission) => can(user, permission))) {
    return { user: null, error: 403, reason: "Forbidden" };
  }
  return { user, error: null, reason: null };
}

export async function requirePermission(permission: Permission): Promise<GuardResult> {
  return requireAnyPermission([permission]);
}