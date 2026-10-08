import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { GALLERY_CATEGORIES } from "@/lib/constants";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("gallery.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const url = typeof body.url === "string" && /^\/(images|uploads)\//.test(body.url) ? body.url : "";
  if (!url) return jsonError("A valid image URL is required.", 400);

  const alt = typeof body.alt === "string" ? body.alt.trim().slice(0, 200) : "";
  if (!alt) return jsonError("Alt text is required for accessibility.", 400);

  const category = typeof body.category === "string" ? body.category : "HOTEL";
  if (!GALLERY_CATEGORIES.includes(category as (typeof GALLERY_CATEGORIES)[number])) {
    return jsonError("Invalid category.", 400);
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : null;
  const sortOrder = typeof body.sortOrder === "number" ? Math.max(0, Math.round(body.sortOrder)) : 0;
  const active = typeof body.active === "boolean" ? body.active : true;

  const image = await prisma.galleryImage.create({ data: { url, alt, category, title, sortOrder, active } });
  return json({ ok: true, image }, 201);
}