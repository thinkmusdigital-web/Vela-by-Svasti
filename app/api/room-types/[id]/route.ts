import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { parseRoomTypeInput } from "@/lib/room-type-data";
import { slugify } from "@/lib/format";
import { Prisma } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("roomTypes.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const id = (await params).id;
  const existing = await prisma.roomType.findUnique({ where: { id } });
  if (!existing) return jsonError("Room type not found", 404);

  const body = await readJson(request);
  const { data, error } = parseRoomTypeInput(body);
  if (error) return jsonError(error, 400);

  let slug = existing.slug;
  const requestedSlug = (data.slug ?? (data.name ? slugify(data.name) : null))?.trim();
  if (requestedSlug && requestedSlug !== existing.slug) {
    const collision = await prisma.roomType.findUnique({ where: { slug: requestedSlug } });
    if (collision && collision.id !== id) return jsonError("Slug is already used by another room type.", 400);
    slug = requestedSlug;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.roomType.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(slug !== existing.slug ? { slug } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.sizeSqft !== undefined ? { sizeSqft: data.sizeSqft } : {}),
        ...(data.bedType !== undefined ? { bedType: data.bedType } : {}),
        ...(data.maxOccupancy !== undefined ? { maxOccupancy: data.maxOccupancy } : {}),
        ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
        ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription } : {}),
      },
    });

    if (data.amenities !== undefined) {
      await tx.roomAmenity.deleteMany({ where: { roomTypeId: id } });
      if (data.amenities.length) {
        await tx.roomAmenity.createMany({
          data: data.amenities.map((name, index) => ({ roomTypeId: id, name, sortOrder: index })),
        });
      }
    }

    if (data.images !== undefined) {
      await tx.roomImage.deleteMany({ where: { roomTypeId: id } });
      if (data.images.length) {
        await tx.roomImage.createMany({
          data: data.images.map((image, index) => ({
            roomTypeId: id,
            url: image.url,
            alt: image.alt ?? "",
            sortOrder: index,
          })),
        });
      }
    }

    return result;
  });

  return json({ ok: true, roomType: updated });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const guard = await requirePermission("roomTypes.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const id = (await params).id;
  const existing = await prisma.roomType.findUnique({ where: { id } });
  if (!existing) return jsonError("Room type not found", 404);

  try {
    await prisma.roomType.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return jsonError("Room type is in use and cannot be deleted. Set it inactive instead.", 400);
    }
    throw error;
  }

  return json({ ok: true });
}