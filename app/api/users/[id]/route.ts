import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/constants";
import { Prisma } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("users.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const id = (await params).id;
  const existing = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!existing) return jsonError("User not found", 404);

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const data: Record<string, unknown> = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) return jsonError("Name is required.", 400);
    data.name = body.name.trim().slice(0, 120);
  }
  if ("email" in body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("A valid email is required.", 400);
    const collision = await prisma.user.findUnique({ where: { email } });
    if (collision && collision.id !== id) return jsonError("That email is already in use.", 400);
    data.email = email;
  }
  if ("password" in body) {
    if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
      return jsonError("Password must be between 8 and 128 characters.", 400);
    }
    data.passwordHash = await hashPassword(body.password);
  }
  if ("active" in body) {
    if (typeof body.active !== "boolean") return jsonError("active must be true or false.", 400);
    if (!body.active && existing.role.name === "SUPER_ADMIN") {
      return jsonError("Ensure at least one active super admin remains.", 400);
    }
    data.active = body.active;
  }
  if ("role" in body) {
    if (typeof body.role !== "string" || !ALL_ROLES.includes(body.role as (typeof ALL_ROLES)[number])) {
      return jsonError("Invalid role.", 400);
    }
    const role = await prisma.role.findUnique({ where: { name: body.role } });
    if (!role) return jsonError("Role not found.", 400);
    data.roleId = role.id;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } },
    });
    return json({ ok: true, user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That email is already in use.", 400);
    }
    throw error;
  }
}