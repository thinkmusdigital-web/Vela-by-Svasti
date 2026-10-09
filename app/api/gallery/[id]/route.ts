import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { adminRateLimit } from "@/lib/rate-limit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("gallery.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = (await params).id;
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) return jsonError("Image not found", 404);

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const data: Record<string, unknown> = {};
  if ("url" in body) {
    if (typeof body.url !== "string" || !/^\/(images|uploads)\//.test(body.url)) {
      return jsonError("A valid image URL is required.", 400);
    }
    data.url = body.url;
  }
  if ("alt" in body) {
    if (typeof body.alt !== "string" || !body.alt.trim()) return jsonError("Alt text is required.", 400);
    data.alt = body.alt.trim().slice(0, 200);
  }
  if ("title" in body) data.title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : null;
  if ("category" in body) {
    if (typeof body.category !== "string" || !GALLERY_CATEGORIES.includes(body.category as (typeof GALLERY_CATEGORIES)[number])) {
      return jsonError("Invalid category.", 400);
    }
    data.category = body.category;
  }
  if ("sortOrder" in body) {
    if (typeof body.sortOrder !== "number") return jsonError("sortOrder must be a number.", 400);
    data.sortOrder = Math.max(0, Math.round(body.sortOrder));
  }
  if ("active" in body) {
    if (typeof body.active !== "boolean") return jsonError("active must be true or false.", 400);
    data.active = body.active;
  }

  const image = await prisma.galleryImage.update({ where: { id }, data });
  return json({ ok: true, image });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("gallery.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = (await params).id;
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) return jsonError("Image not found", 404);

  await prisma.galleryImage.delete({ where: { id } });
  return json({ ok: true });
}