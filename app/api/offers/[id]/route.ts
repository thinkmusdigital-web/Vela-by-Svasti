import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { parseOfferInput } from "@/lib/offer-data";
import { slugify } from "@/lib/format";
import { adminRateLimit } from "@/lib/rate-limit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("offers.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = (await params).id;
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) return jsonError("Offer not found", 404);

  const body = await readJson(request);
  const { data, error } = parseOfferInput(body);
  if (error) return jsonError(error, 400);

  if (data.roomTypeId) {
    const roomType = await prisma.roomType.findUnique({ where: { id: data.roomTypeId } });
    if (!roomType) return jsonError("Room type not found.", 400);
  }

  let slug = existing.slug;
  const requestedSlug = (data.slug ?? (data.name ? slugify(data.name) : null))?.trim();
  if (requestedSlug && requestedSlug !== existing.slug) {
    const collision = await prisma.offer.findUnique({ where: { slug: requestedSlug } });
    if (collision && collision.id !== id) return jsonError("Slug is already used by another offer.", 400);
    slug = requestedSlug;
  }

  const offer = await prisma.offer.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(slug !== existing.slug ? { slug } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.terms !== undefined ? { terms: data.terms } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.roomTypeId !== undefined ? { roomTypeId: data.roomTypeId } : {}),
      ...(data.validFrom !== undefined ? { validFrom: data.validFrom } : {}),
      ...(data.validUntil !== undefined ? { validUntil: data.validUntil } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });

  return json({ ok: true, offer });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("offers.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = (await params).id;
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) return jsonError("Offer not found", 404);

  await prisma.offer.delete({ where: { id } });
  return json({ ok: true });
}