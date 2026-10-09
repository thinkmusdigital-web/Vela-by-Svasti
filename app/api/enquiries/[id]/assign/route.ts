import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { logEnquiryActivity } from "@/lib/audit";
import { ROLES } from "@/lib/constants";
import { adminRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const assignSchema = z.object({
  assignedStaffId: z.string().trim().min(1).nullable().optional(),
});

const ASSIGNABLE_ROLES = [ROLES.SUPER_ADMIN, ROLES.HOTEL_MANAGER, ROLES.RESERVATION_STAFF, ROLES.SALES_STAFF];

export async function PATCH(request: Request, { params }: RouteProps) {
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

  const body = await readJson(request);
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid assignment.", 400);

  const targetId: string | null = parsed.data.assignedStaffId ?? null;

  if (targetId) {
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      include: { role: true },
    });
    if (!target || !target.active || !ASSIGNABLE_ROLES.includes(target.role.name as (typeof ASSIGNABLE_ROLES)[number])) {
      return jsonError("That staff member is not available for assignment.", 400);
    }
  }

  if (targetId === enquiry.assignedStaffId) {
    return json({ enquiry, message: "Enquiry is already assigned to this staff member." });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.enquiry.update({
      where: { id: enquiry.id },
      data: { assignedStaffId: targetId },
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    });

    await logEnquiryActivity(tx, {
      enquiryId: enquiry.id,
      actor: user,
      action: targetId ? "ENQUIRY_ASSIGNED" : "ENQUIRY_UNASSIGNED",
      oldValue: enquiry.assignedStaff?.name ?? "Unassigned",
      newValue: result.assignedStaff?.name ?? "Unassigned",
    });

    return result;
  });

  return json({ enquiry: updated });
}