import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type ActivityAction =
  | "ENQUIRY_CREATED"
  | "ENQUIRY_ASSIGNED"
  | "ENQUIRY_UNASSIGNED"
  | "STATUS_CHANGED"
  | "CALL_STATUS_CHANGED"
  | "CUSTOMER_CALLED"
  | "FOLLOW_UP_CREATED"
  | "FOLLOW_UP_CLEARED"
  | "QUOTATION_UPDATED"
  | "REMARKS_UPDATED"
  | "RESPONSE_UPDATED"
  | "LAST_CONTACTED_UPDATED"
  | "CONTACT_METHOD_UPDATED"
  | "ENQUIRY_UPDATED"
  | "ENQUIRY_DELETED";

export interface ActivityActor {
  id?: string;
  name?: string;
}

export async function logEnquiryActivity(
  tx: Prisma.TransactionClient | typeof prisma,
  data: {
    enquiryId: number;
    actor?: ActivityActor | null;
    action: ActivityAction;
    oldValue?: string | null;
    newValue?: string | null;
  },
) {
  await tx.enquiryActivityLog.create({
    data: {
      enquiryId: data.enquiryId,
      userId: data.actor?.id ?? null,
      userLabel: data.actor?.name ?? "Website visitor",
      action: data.action,
      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,
    },
  });
}
