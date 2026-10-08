import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { logEnquiryActivity } from "@/lib/audit";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS } from "@/lib/constants";
import { z } from "zod";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const statusSchema = z.object({
  finalStatus: z.enum(ENQUIRY_STATUSES),
});

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.manage")) return jsonError("Forbidden", 403);

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return jsonError("Invalid enquiry", 400);

  const { enquiry, forbidden } = await getEnquiryForUser(id, user);
  if (forbidden) return jsonError("Forbidden", 403);
  if (!enquiry) return jsonError("Not found", 404);

  const body = await readJson(request);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid status. Allowed: " + ENQUIRY_STATUSES.join(", "), 400);
  }

  const next = parsed.data.finalStatus;
  if (next === enquiry.finalStatus) {
    return json({ enquiry, message: "Status is already set." });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.enquiry.update({
      where: { id: enquiry.id },
      data: { finalStatus: next },
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    });

    await logEnquiryActivity(tx, {
      enquiryId: enquiry.id,
      actor: user,
      action: "STATUS_CHANGED",
      oldValue: `${ENQUIRY_STATUS_LABELS[enquiry.finalStatus as keyof typeof ENQUIRY_STATUS_LABELS]} (${enquiry.finalStatus})`,
      newValue: `${ENQUIRY_STATUS_LABELS[next as keyof typeof ENQUIRY_STATUS_LABELS]} (${next})`,
    });

    if (next === ENQUIRY_STATUS.CONVERTED) {
      await logEnquiryActivity(tx, {
        enquiryId: enquiry.id,
        actor: user,
        action: "ENQUIRY_UPDATED",
        newValue: "Enquiry converted to a confirmed stay",
      });
    }
    if (next === ENQUIRY_STATUS.CLOSED) {
      await logEnquiryActivity(tx, {
        enquiryId: enquiry.id,
        actor: user,
        action: "ENQUIRY_UPDATED",
        newValue: "Enquiry closed",
      });
    }

    return result;
  });

  return json({ enquiry: updated });
}