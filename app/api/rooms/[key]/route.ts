import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { adminRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

interface RouteProps {
  params: Promise<{ key: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("rooms.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = (await params).key;
  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) return jsonError("Room not found", 404);

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const data: Record<string, unknown> = {};
  if ("roomNumber" in body) {
    if (typeof body.roomNumber !== "string" || !body.roomNumber.trim()) {
      return jsonError("Room number is required.", 400);
    }
    data.roomNumber = body.roomNumber.trim().slice(0, 30);
  }
  if ("floor" in body) data.floor = typeof body.floor === "string" ? body.floor.trim().slice(0, 20) : null;
  if ("notes" in body) data.notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null;
  if ("active" in body) {
    if (typeof body.active !== "boolean") return jsonError("active must be true or false.", 400);
    data.active = body.active;
  }

  try {
    const room = await prisma.room.update({
      where: { id },
      data,
      include: { roomType: { select: { id: true, name: true } } },
    });
    return json({ ok: true, room });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That room number already exists.", 400);
    }
    throw error;
  }
}