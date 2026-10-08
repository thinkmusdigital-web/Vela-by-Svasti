import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { parseRoomTypeInput } from "@/lib/room-type-data";
import { slugify, ensureUniqueSlug } from "@/lib/format";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("roomTypes.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const body = await readJson(request);
  const { data, error } = parseRoomTypeInput(body);
  if (error) return jsonError(error, 400);
  if (!data.name) return jsonError("Name is required.", 400);

  const baseSlug = data.slug ?? slugify(data.name);
  const slug = await ensureUniqueSlug(baseSlug, async (candidate) =>
    Boolean(await prisma.roomType.findUnique({ where: { slug: candidate } })),
  );

  const roomType = await prisma.$transaction(async (tx) => {
    const created = await tx.roomType.create({
      data: {
        name: data.name as string,
        slug,
        shortDescription: data.shortDescription ?? "",
        description: data.description ?? "",
        sizeSqft: data.sizeSqft ?? null,
        bedType: data.bedType ?? "",
        maxOccupancy: data.maxOccupancy ?? 2,
        displayOrder: data.displayOrder ?? 0,
        active: data.active ?? true,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
    });

    if (data.amenities?.length) {
      await tx.roomAmenity.createMany({
        data: data.amenities.map((name, index) => ({
          roomTypeId: created.id,
          name,
          sortOrder: index,
        })),
      });
    }

    if (data.images?.length) {
      await tx.roomImage.createMany({
        data: data.images.map((image, index) => ({
          roomTypeId: created.id,
          url: image.url,
          alt: image.alt ?? "",
          sortOrder: index,
        })),
      });
    }

    return created;
  });

  return json({ ok: true, roomType }, 201);
}

export async function GET() {
  const user = await getCurrentUser();
  const all = user && (await requirePermission("roomTypes.manage")).error === null;

  const roomTypes = await prisma.roomType.findMany({
    where: all ? {} : { active: true },
    orderBy: { displayOrder: "asc" },
    include: {
      images: {
        select: { id: true, url: true, alt: true, sortOrder: true },
        orderBy: { sortOrder: "asc" as const },
      },
      amenities: { select: { id: true, name: true } },
      _count: { select: { rooms: true } },
    },
    take: 100,
  });

  return json({ roomTypes });
}