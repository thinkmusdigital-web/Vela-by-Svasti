import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAnyPermission } from "@/lib/admin-guard";
import { json, jsonError, assertSameOrigin } from "@/lib/http";
import { adminRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const guard = await requireAnyPermission([
    "gallery.manage",
    "roomTypes.manage",
    "offers.manage",
    "content.manage",
  ]);
  if (guard.error) return jsonError(guard.reason, guard.error);

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Expected multipart form data.", 400);

  const file = form.get("file");
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    return jsonError("Upload a file with field name 'file'.", 400);
  }

  const type = file.type;
  if (!ALLOWED[type]) {
    return jsonError("Only JPG, PNG, WebP or GIF images are allowed.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return jsonError("Image must be 8 MB or smaller.", 413);
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const name = `${Date.now()}-${crypto.randomUUID()}.${ALLOWED[type]}`;
  await writeFile(path.join(dir, name), buffer);

  return json({ ok: true, url: `/uploads/${name}`, size: buffer.byteLength }, 201);
}