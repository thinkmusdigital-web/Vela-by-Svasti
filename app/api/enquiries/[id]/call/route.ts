import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { logEnquiryActivity } from "@/lib/audit";
import { CALL_STATUSES, CALL_STATUS_LABELS, CALL_STATUS, ENQUIRY_STATUSES, type CallStatus } from "@/lib/constants";
import { paragraph } from "@/lib/sanitize";
import { z } from "zod";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const callSchema = z.object({
  callStatus: z.enum(CALL_STATUSES).optional(),
  customerResponse: z.string().max(2000).optional(),
  remarks: z.string().max(2000).optional(),
  quotationAmount: z.number().min(0).max(1_000_000_000).nullable().optional(),
  followUpDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  finalStatus: z.enum(ENQUIRY_STATUSES).optional(),
  calledAt: z.boolean().optional(),
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
  const parsed = callSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid call update.", 400);

  const data = parsed.data;
  const updates: Record<string, unknown> = {};
  const logs: { action: Parameters<typeof logEnquiryActivity>[1]["action"]; oldValue?: string; newValue?: string }[] = [];

  const markCalled = data.calledAt === true || data.callStatus === CALL_STATUS.CALLED;
  if (markCalled && !enquiry.lastContactedAt) {
    updates.lastContactedAt = new Date();
    logs.push({ action: "LAST_CONTACTED_UPDATED", newValue: new Date().toISOString() });
  }

  if (data.callStatus && data.callStatus !== enquiry.callStatus) {
    updates.callStatus = data.callStatus;
    logs.push({
      action: "CALL_STATUS_CHANGED",
      oldValue: `${CALL_STATUS_LABELS[enquiry.callStatus as CallStatus]} (${enquiry.callStatus})`,
      newValue: `${CALL_STATUS_LABELS[data.callStatus as CallStatus]} (${data.callStatus})`,
    });
    if (data.callStatus === CALL_STATUS.CALLED) {
      logs.push({ action: "CUSTOMER_CALLED", newValue: user.name });
    }
  }

  if (data.customerResponse !== undefined) {
    const value = paragraph(data.customerResponse);
    if (value !== (enquiry.customerResponse ?? "")) {
      updates.customerResponse = value;
      logs.push({ action: "RESPONSE_UPDATED", oldValue: enquiry.customerResponse ?? "", newValue: value });
    }
  }

  if (data.remarks !== undefined) {
    const value = paragraph(data.remarks);
    if (value !== (enquiry.remarks ?? "")) {
      updates.remarks = value;
      logs.push({ action: "REMARKS_UPDATED", oldValue: enquiry.remarks ?? "", newValue: value });
    }
  }

  if (data.quotationAmount !== undefined) {
    const next = data.quotationAmount;
    if (next !== enquiry.quotationAmount) {
      updates.quotationAmount = next;
      logs.push({
        action: "QUOTATION_UPDATED",
        oldValue: enquiry.quotationAmount?.toString() ?? "",
        newValue: next?.toString() ?? "",
      });
    }
  }

  if (data.followUpDate !== undefined) {
    const value = data.followUpDate ? new Date(`${data.followUpDate}T00:00:00.000Z`) : null;
    if (value && (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== data.followUpDate)) {
      return jsonError("Follow-up date is invalid.", 400);
    }
    const oldIso = enquiry.followUpDate?.toISOString() ?? "";
    const newIso = value?.toISOString() ?? "";
    if (newIso !== oldIso) {
      updates.followUpDate = value;
      logs.push({
        action: value && !enquiry.followUpDate ? "FOLLOW_UP_CREATED" : "ENQUIRY_UPDATED",
        oldValue: oldIso,
        newValue: newIso,
      });
    }
  }

  if (data.finalStatus && data.finalStatus !== enquiry.finalStatus) {
    updates.finalStatus = data.finalStatus;
    logs.push({
      action: "STATUS_CHANGED",
      oldValue: enquiry.finalStatus,
      newValue: data.finalStatus,
    });
  }

  if (Object.keys(updates).length === 0) {
    return json({ enquiry, message: "No changes applied." });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.enquiry.update({
      where: { id: enquiry.id },
      data: updates,
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    });
    for (const log of logs) {
      await logEnquiryActivity(tx, {
        enquiryId: enquiry.id,
        actor: user,
        action: log.action,
        oldValue: log.oldValue,
        newValue: log.newValue,
      });
    }
    return result;
  });

  return json({ enquiry: updated });
}