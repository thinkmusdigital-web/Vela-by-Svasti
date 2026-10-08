import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { logEnquiryActivity } from "@/lib/audit";
import { singleLine } from "@/lib/sanitize";
import { z } from "zod";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const followUpSchema = z.object({
  note: z.string().max(2000).default(""),
  followUpDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      z.null(),
    ])
    .optional(),
  completeFollowUpId: z.string().min(1).optional(),
});

export async function POST(request: Request, { params }: RouteProps) {
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
  const parsed = followUpSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid follow-up.", 400);

  const note = singleLine(parsed.data.note);
  if (!note && parsed.data.completeFollowUpId === undefined) {
    return jsonError("Add a short note before saving the follow-up.", 400);
  }

  let followUpDate: Date | null = null;
  if (parsed.data.followUpDate) {
    const value = new Date(`${parsed.data.followUpDate}T00:00:00.000Z`);
    if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== parsed.data.followUpDate) {
      return jsonError("Follow-up date is invalid.", 400);
    }
    followUpDate = value;
  }

  const result = await prisma.$transaction(async (tx) => {
    if (parsed.data.completeFollowUpId) {
      const existing = await tx.enquiryFollowup.findUnique({ where: { id: parsed.data.completeFollowUpId } });
      if (existing && existing.enquiryId === enquiry.id && !existing.completedAt) {
        await tx.enquiryFollowup.update({
          where: { id: existing.id },
          data: { completedAt: new Date() },
        });
      }
    }

    const followup = await tx.enquiryFollowup.create({
      data: {
        enquiryId: enquiry.id,
        createdByUserId: user.id,
        note,
        followUpDate,
      },
    });

    const updated = await tx.enquiry.update({
      where: { id: enquiry.id },
      data: followUpDate ? { followUpDate } : {},
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    });

    await logEnquiryActivity(tx, {
      enquiryId: enquiry.id,
      actor: user,
      action: "FOLLOW_UP_CREATED",
      newValue: followUpDate ? `Next follow-up ${followUpDate.toISOString().slice(0, 10)}${note ? ` · ${note}` : ""}` : note,
    });

    return { followup, updated };
  });

  return json({ ok: true, followup: result.followup, enquiry: result.updated }, 201);
}

export async function GET() {
  return jsonError("Method not allowed", 405);
}