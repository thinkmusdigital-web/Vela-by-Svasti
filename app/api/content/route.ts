import { requirePermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { paragraph } from "@/lib/sanitize";

export async function PUT(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const guard = await requirePermission("content.manage");
  if (guard.error) return jsonError(guard.reason, guard.error);

  const body = await readJson(request);
  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items)) {
    return jsonError("Send { items: [{ key, value }] }.", 400);
  }

  const items = ((body as { items: unknown[] }).items ?? []).slice(0, 200);
  const clean: { key: string; value: string }[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const { key, value } = item as { key?: unknown; value?: unknown };
    if (typeof key !== "string" || !key.trim() || key.length > 255) continue;
    if (typeof value !== "string" || value.length > 20000) continue;
    clean.push({ key: key.trim(), value: paragraph(value) });
  }

  if (clean.length === 0) return jsonError("No valid content entries to save.", 400);

  await prisma.$transaction(
    clean.map(({ key, value }) =>
      prisma.websiteContent.upsert({
        where: { key },
        create: { key, value, label: key },
        update: { value },
      }),
    ),
  );

  return json({ ok: true, count: clean.length });
}