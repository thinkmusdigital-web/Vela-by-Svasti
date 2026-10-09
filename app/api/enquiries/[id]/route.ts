import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { logEnquiryActivity } from "@/lib/audit";
import { adminRateLimit } from "@/lib/rate-limit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.manage")) return jsonError("Forbidden", 403);

  const limited = adminRateLimit(request);
  if (!limited.ok) {
    return jsonError("Too many requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return jsonError("Invalid enquiry", 400);

  const { enquiry, forbidden } = await getEnquiryForUser(id, user);
  if (forbidden) return jsonError("Forbidden", 403);
  if (!enquiry) return jsonError("Not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.enquiry.update({ where: { id }, data: { deletedAt: new Date() } });
    await logEnquiryActivity(tx, {
      enquiryId: id,
      actor: user,
      action: "ENQUIRY_DELETED",
      oldValue: enquiry.enquiryId,
    });
  });

  return json({ ok: true });
}