import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/constants";
import { adminRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("users.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const active = typeof body.active === "boolean" ? body.active : true;
  const roleName = typeof body.role === "string" ? body.role : "";

  if (!name) return jsonError("Name is required.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("A valid email is required.", 400);
  if (password.length < 8 || password.length > 128) {
    return jsonError("Password must be between 8 and 128 characters.", 400);
  }
  if (!ALL_ROLES.includes(roleName as (typeof ALL_ROLES)[number])) {
    return jsonError("Invalid role.", 400);
  }

  const [role, existing] = await Promise.all([
    prisma.role.findUnique({ where: { name: roleName } }),
    prisma.user.findUnique({ where: { email } }),
  ]);
  if (!role) return jsonError("Role not found.", 400);
  if (existing) return jsonError("A user with that email already exists.", 400);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      roleId: role.id,
      active,
    },
    select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } },
  });

  return json({ ok: true, user }, 201);
}