import "server-only";
import { prisma } from "@/lib/db";
import { canViewEnquiry, type PermissionUser } from "@/lib/rbac";

export const ENQUIRY_INCLUDE = {
  roomType: { select: { id: true, name: true, slug: true } },
  assignedStaff: { select: { id: true, name: true } },
  followups: {
    orderBy: { createdAt: "desc" as const },
    take: 20,
    select: {
      id: true,
      note: true,
      followUpDate: true,
      completedAt: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  },
} as const;

export async function getEnquiryForUser(id: number, user: PermissionUser) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: ENQUIRY_INCLUDE,
  });

  if (!enquiry || enquiry.deletedAt) return { enquiry: null, forbidden: false };
  if (!canViewEnquiry(user, enquiry)) return { enquiry: null, forbidden: true };
  return { enquiry, forbidden: false };
}