import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/admin-guard";
import { Prisma } from "@prisma/client";

export const revalidate = 300;

const INCLUDE = {
  images: {
    select: { id: true, url: true, alt: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  amenities: { select: { id: true, name: true } },
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeAll = url.searchParams.get("all") === "1";

  if (includeAll) {
    const guard = await requirePermission("roomTypes.manage");
    if (guard.error) return jsonError(guard.reason, guard.error);
  }

  const roomTypes = await prisma.roomType.findMany({
    where: includeAll ? {} : { active: true },
    orderBy: { displayOrder: "asc" },
    include: { ...INCLUDE, _count: { select: { rooms: true } } },
    take: 100,
  });

  return json({ roomTypes });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("rooms.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const roomTypeId = typeof body.roomTypeId === "string" ? body.roomTypeId : "";
  const roomNumber = typeof body.roomNumber === "string" ? body.roomNumber.trim().slice(0, 30) : "";
  const floor = typeof body.floor === "string" ? body.floor.trim().slice(0, 20) : null;
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null;
  const active = typeof body.active === "boolean" ? body.active : true;

  if (!roomTypeId || !roomNumber) return jsonError("Room type and room number are required.", 400);
  const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
  if (!roomType) return jsonError("Room type not found.", 400);

  try {
    const room = await prisma.room.create({
      data: { roomTypeId, roomNumber, floor, notes, active },
    });
    return json({ ok: true, room }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That room number already exists.", 400);
    }
    throw error;
  }
}