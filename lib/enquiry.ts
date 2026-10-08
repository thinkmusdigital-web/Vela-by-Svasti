import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logEnquiryActivity } from "@/lib/audit";
import type { EnquiryInput } from "@/lib/validate";

export function formatEnquiryNumber(n: number): string {
  return `ENQ-${String(n).padStart(6, "0")}`;
}

/**
 * Allocates the next enquiry number server-side with an atomic counter update
 * (UPDATE ... RETURNING), so concurrent submissions can never receive the same ID.
 */
async function allocateEnquiryId(tx: Prisma.TransactionClient): Promise<string> {
  const rows = await tx.$queryRaw<{ value: string }[]>`
    UPDATE "Setting"
    SET "value" = CAST(CAST("value" AS INTEGER) + 1 AS TEXT)
    WHERE "key" = 'enquiry_counter'
    RETURNING "value"`;

  if (rows.length > 0) {
    return formatEnquiryNumber(Number(rows[0].value));
  }

  await tx.setting.upsert({
    where: { key: "enquiry_counter" },
    update: { value: "1" },
    create: { key: "enquiry_counter", value: "1", label: "Enquiry counter", group: "system", type: "number" },
  });
  return formatEnquiryNumber(1);
}

const SIMILAR_CHECK_IN_DAYS = 3;
const RECENT_ENQUIRY_DAYS = 30;

export interface DuplicateCandidate {
  id: number;
  enquiryId: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  checkInDate: Date | null;
  createdAt: Date;
}

function isSimilarDuplicate(candidate: DuplicateCandidate, input: EnquiryInput): boolean {
  const sameMobile = candidate.mobileNumber === input.mobileNumber;
  const sameEmail = candidate.email.toLowerCase() === input.email.toLowerCase();
  if (!sameMobile && !sameEmail) return false;

  if (input.checkInDate && candidate.checkInDate) {
    const diffDays =
      Math.abs(input.checkInDate.getTime() - candidate.checkInDate.getTime()) / 86_400_000;
    if (diffDays <= SIMILAR_CHECK_IN_DAYS) return true;
  }

  const ageDays = (Date.now() - candidate.createdAt.getTime()) / 86_400_000;
  return ageDays <= RECENT_ENQUIRY_DAYS;
}

export interface CreateEnquiryResult {
  id: number;
  enquiryId: string;
  possibleDuplicate: boolean;
  duplicateOf: { id: number; enquiryId: string; customerName: string; createdAt: Date } | null;
}

/**
 * Creates an enquiry. Duplicates are never rejected or deleted — they are
 * stored and flagged so staff can decide (business rule 23).
 */
export async function createEnquiry(
  input: EnquiryInput,
  ctx: { ip?: string } = {},
): Promise<CreateEnquiryResult> {
  if (input.roomTypeId) {
    const roomType = await prisma.roomType.findFirst({
      where: { id: input.roomTypeId, active: true },
      select: { id: true },
    });
    if (!roomType) input = { ...input, roomTypeId: undefined };
  }

  const candidates = await prisma.enquiry.findMany({
    where: {
      deletedAt: null,
      OR: [
        { mobileNumber: input.mobileNumber },
        { email: input.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      enquiryId: true,
      customerName: true,
      mobileNumber: true,
      email: true,
      checkInDate: true,
      createdAt: true,
    },
  });

  const duplicate = candidates.find((candidate) => isSimilarDuplicate(candidate, input)) ?? null;

  const enquiry = await prisma.$transaction(async (tx) => {
    const enquiryId = await allocateEnquiryId(tx);

    const created = await tx.enquiry.create({
      data: {
        enquiryId,
        enquiryType: input.enquiryType,
        customerName: input.customerName,
        mobileNumber: input.mobileNumber,
        email: input.email.toLowerCase(),
        checkInDate: input.checkInDate ?? null,
        checkOutDate: input.checkOutDate ?? null,
        adults: input.adults,
        children: input.children,
        roomTypeId: input.roomTypeId ?? null,
        numberOfRooms: input.numberOfRooms,
        purposeOfStay: input.purposeOfStay ?? null,
        specialRequest: input.specialRequest ?? null,
        preferredContact: input.preferredContact,
        source: "Website",
        companyName: input.companyName ?? null,
        eventType: input.eventType ?? null,
        expectedGuests: input.expectedGuests ?? null,
        approximateBudget: input.approximateBudget ?? null,
        preferredCallTime: input.preferredCallTime ?? null,
        finalStatus: "NEW",
        callStatus: "PENDING_CALL",
        isPossibleDuplicate: Boolean(duplicate),
        duplicateOfId: duplicate?.id ?? null,
        createdByIp: ctx.ip ?? null,
      },
    });

    await logEnquiryActivity(tx, {
      enquiryId: created.id,
      action: "ENQUIRY_CREATED",
      actor: null,
      newValue: `Enquiry received from the website (${input.enquiryType})`,
    });

    return created;
  });

  return {
    id: enquiry.id,
    enquiryId: enquiry.enquiryId,
    possibleDuplicate: Boolean(duplicate),
    duplicateOf: duplicate
      ? {
          id: duplicate.id,
          enquiryId: duplicate.enquiryId,
          customerName: duplicate.customerName,
          createdAt: duplicate.createdAt,
        }
      : null,
  };
}

/** Finds live enquiries that look like the given enquiry (used by the admin detail view). */
export async function findPossibleDuplicates(enquiry: {
  id: number;
  mobileNumber: string;
  email: string;
  checkInDate: Date | null;
}) {
  return prisma.enquiry.findMany({
    where: {
      deletedAt: null,
      id: { not: enquiry.id },
      OR: [{ mobileNumber: enquiry.mobileNumber }, { email: enquiry.email }],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      enquiryId: true,
      customerName: true,
      mobileNumber: true,
      email: true,
      checkInDate: true,
      createdAt: true,
      finalStatus: true,
    },
  });
}
