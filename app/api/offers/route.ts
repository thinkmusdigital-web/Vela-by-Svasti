import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/format";
import { parseOfferInput } from "@/lib/offer-data";
import { adminRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("offers.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

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