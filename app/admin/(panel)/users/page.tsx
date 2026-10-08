import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { UsersManager } from "@/components/admin/users-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "users.manage")) redirect("/admin");

  const dbUsers = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { role: true },
  });

  const rows = dbUsers.map((dbUser) => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    active: dbUser.active,
    role: dbUser.role.name,
    lastActiveAt: dbUser.lastLoginAt?.toISOString() ?? null,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Staff accounts and roles. Assign enquiries to sales staff and control what each role can do."
      />
      <UsersManager users={rows} currentUserId={user.id} />
    </>
  );
}