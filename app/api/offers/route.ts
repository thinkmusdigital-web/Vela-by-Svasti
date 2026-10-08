import { requirePermission } from "@/lib/admin-guard";
import { getCurrentUser } from "@/lib/auth";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/format";
import { can } from "@/lib/rbac";
import { parseOfferInput } from "@/lib/offer-data";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("offers.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const body = await readJson(request);
  const { data, error } = parseOfferInput(body);
  if (error) return jsonError(error, 400);
  if (!data.name) return jsonError("Name is required.", 400);

  if (data.roomTypeId) {
    const roomType = await prisma.roomType.findUnique({ where: { id: data.roomTypeId } });
    if (!roomType) return jsonError("Room type not found.", 400);
  }

  const baseSlug = data.slug ?? slugify(data.name);
  const slug = await ensureUniqueSlug(baseSlug, async (candidate) =>
    Boolean(await prisma.offer.findUnique({ where: { slug: candidate } })),
  );

  const offer = await prisma.offer.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? "",
      terms: data.terms ?? "",
      imageUrl: data.imageUrl ?? null,
      roomTypeId: data.roomTypeId ?? null,
      validFrom: data.validFrom ?? null,
      validUntil: data.validUntil ?? null,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return json({ ok: true, offer }, 201);
}

export async function GET() {
  const user = await getCurrentUser();
  const canManage = can(user, "offers.manage");

  const offers = await prisma.offer.findMany({
    where: canManage ? {} : { active: true },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    include: { roomType: { select: { id: true, name: true } } },
    take: 200,
  });

  return json({ offers });
}