import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { json, jsonError } from "@/lib/http";
import { getDashboardSummary } from "@/lib/enquiry-query";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (!can(user, "enquiry.viewAll") && !can(user, "enquiry.viewAssigned")) {
    return jsonError("Forbidden", 403);
  }

  const scope = { all: can(user, "enquiry.viewAll"), userId: user.id };

  const [summary, distribution, recent] = await Promise.all([
    getDashboardSummary(scope),
    prisma.enquiry.groupBy({
      by: ["finalStatus"],
      where: { deletedAt: null, ...(scope.all ? {} : { assignedStaffId: scope.userId }) },
      _count: { _all: true },
    }),
    prisma.enquiry.findMany({
      where: { deletedAt: null, ...(scope.all ? {} : { assignedStaffId: scope.userId }) },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        enquiryId: true,
        enquiryType: true,
        customerName: true,
        finalStatus: true,
        createdAt: true,
        roomType: { select: { name: true } },
      },
    }),
  ]);

  return json({
    summary,
    distribution: distribution.map((d) => ({ status: d.finalStatus, count: d._count._all })),
    recent,
  });
}