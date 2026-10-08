import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { findPossibleDuplicates } from "@/lib/enquiry";
import { logEnquiryActivity } from "@/lib/audit";
import { paragraph } from "@/lib/sanitize";
import {
  PREFERRED_CONTACTS,
} from "@/lib/constants";

interface RouteProps {
  params: Promise<{ id: string }>;
}

function parseDay(value: unknown): Date | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  return date;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.viewAll") && !can(user, "enquiry.viewAssigned")) {
    return jsonError("Forbidden", 403);
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return jsonError("Invalid enquiry", 400);

  const { enquiry, forbidden } = await getEnquiryForUser(id, user);
  if (forbidden) return jsonError("Forbidden", 403);
  if (!enquiry) return jsonError("Not found", 404);

  const activityLogs = await prisma.enquiryActivityLog.findMany({
    where: { enquiryId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      action: true,
      oldValue: true,
      newValue: true,
      userLabel: true,
      createdAt: true,
    },
  });

  const duplicates = await findPossibleDuplicates(enquiry);

  return json({ enquiry, activityLogs, possibleDuplicates: duplicates });
}

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

  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  const updates: Record<string, unknown> = {};
  const logs: { action: string; oldValue?: string; newValue?: string }[] = [];

  if ("remarks" in body) {
    if (typeof body.remarks !== "string" || body.remarks.length > 4000) {
      return jsonError("Remarks must be text up to 4000 characters.", 400);
    }
    const value = paragraph(body.remarks);
    if (value !== (enquiry.remarks ?? "")) {
      updates.remarks = value;
      logs.push({ action: "REMARKS_UPDATED", oldValue: enquiry.remarks ?? "", newValue: value });
    }
  }

  if ("customerResponse" in body) {
    if (typeof body.customerResponse !== "string" || body.customerResponse.length > 4000) {
      return jsonError("Customer response must be text up to 4000 characters.", 400);
    }
    const value = paragraph(body.customerResponse);
    if (value !== (enquiry.customerResponse ?? "")) {
      updates.customerResponse = value;
      logs.push({ action: "RESPONSE_UPDATED", oldValue: enquiry.customerResponse ?? "", newValue: value });
    }
  }

  if ("quotationAmount" in body) {
    const value = Number(body.quotationAmount);
    if (body.quotationAmount !== null && (Number.isNaN(value) || value < 0 || value > 1_000_000_000)) {
      return jsonError("Quotation amount is invalid.", 400);
    }
    const next = body.quotationAmount === null ? null : value;
    if (next !== enquiry.quotationAmount) {
      updates.quotationAmount = next;
      logs.push({
        action: "QUOTATION_UPDATED",
        oldValue: enquiry.quotationAmount?.toString() ?? "",
        newValue: next?.toString() ?? "",
      });
    }
  }

  if ("preferredContact" in body) {
    if (typeof body.preferredContact !== "string" || !PREFERRED_CONTACTS.includes(body.preferredContact as (typeof PREFERRED_CONTACTS)[number])) {
      return jsonError("Invalid preferred contact method.", 400);
    }
    if (body.preferredContact !== enquiry.preferredContact) {
      updates.preferredContact = body.preferredContact;
      logs.push({
        action: "CONTACT_METHOD_UPDATED",
        oldValue: enquiry.preferredContact,
        newValue: String(body.preferredContact),
      });
    }
  }

  if ("followUpDate" in body) {
    const value = parseDay(body.followUpDate);
    if (value === undefined) return jsonError("Follow-up date is invalid.", 400);
    const oldValue = enquiry.followUpDate;
    if ((value ?? null)?.toISOString?.() !== oldValue?.toISOString()) {
      updates.followUpDate = value;
      logs.push({
        action: oldValue && !value ? "FOLLOW_UP_CLEARED" : value && !oldValue ? "FOLLOW_UP_CREATED" : "ENQUIRY_UPDATED",
        oldValue: oldValue?.toISOString() ?? "",
        newValue: value?.toISOString() ?? "",
      });
    }
  }

  if (Object.keys(updates).length === 0) {
    return json({ enquiry, message: "No changes applied" });
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
        action: log.action as Parameters<typeof logEnquiryActivity>[1]["action"],
        oldValue: log.oldValue,
        newValue: log.newValue,
      });
    }
    return result;
  });

  return json({ enquiry: updated });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.manage")) return jsonError("Forbidden", 403);

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