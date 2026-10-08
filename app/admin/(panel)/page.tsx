import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getDashboardSummary } from "@/lib/enquiry-query";
import { prisma } from "@/lib/db";
import { Badge, StatCard, Card, PageHeader, Th, Td, EmptyState } from "@/components/admin/ui";
import {
  ENQUIRY_STATUS,
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatMobile, relativeDay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "dashboard.view")) redirect("/admin/login");

  const scope = { all: can(user, "enquiry.viewAll"), userId: user.id };
  const base = scope.all ? { deletedAt: null } : { deletedAt: null, assignedStaffId: user.id };

  const [summary, recent] = await Promise.all([
    getDashboardSummary(scope),
    prisma.enquiry.findMany({
      where: base,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        roomType: { select: { name: true } },
        assignedStaff: { select: { name: true } },
      },
    }),
  ]);

  const openCount =
    summary.statusCounts.NEW +
    summary.statusCounts.CONTACTED +
    summary.statusCounts.FOLLOW_UP +
    summary.statusCounts.QUOTATION_SENT;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description={scope.all ? "All enquiries, across every team member." : "Enquiries assigned to you."}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
        <StatCard label="Total enquiries" value={summary.total} sub={`${summary.today} received today`} />
        <StatCard label="Open" value={openCount} sub="New, contacted, follow-up or quotation sent" tone="brand" />
        <StatCard label="Due follow-ups" value={summary.dueToday} sub={`${summary.overdue} overdue`} tone={summary.dueToday > 0 ? "danger" : "neutral"} />
        <StatCard label="Conversion rate" value={`${summary.conversionRate}%`} sub="Converted ÷ total" tone={summary.conversionRate > 0 ? "success" : "neutral"} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">By status</p>
          <div className="mt-4 space-y-3">
            {ENQUIRY_STATUSES.map((status) => {
              const count = summary.statusCounts[status] ?? 0;
              const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="font-medium text-ink">{ENQUIRY_STATUS_LABELS[status]}</span>
                    <span className="text-stone">
                      {count} <span className="text-fog">({pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-sand">
                    <div className="h-1.5 bg-brass" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Due follow-ups</p>
          {summary.dueFollowUps.length === 0 ? (
            <p className="mt-4 text-[0.85rem] text-stone">Nothing due right now.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {summary.dueFollowUps.slice(0, 8).map((row) => (
                <li key={row.id} className="py-3">
                  <Link href={`/admin/enquiries/${row.id}`} className="group">
                    <p className="text-[0.85rem] font-medium text-ink group-hover:text-brass-deep">
                      {row.customerName}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-fog">
                      {row.enquiryId} · {relativeDay(row.followUpDate as Date)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Recent enquiries</p>
          <Link href="/admin/enquiries" className="link-underline text-[0.8rem]">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No enquiries yet" body="Enquiries submitted through the website appear here." />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sand/60">
                <tr>
                  <Th>Enquiry</Th>
                  <Th>Received</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th>Room</Th>
                  <Th>Status</Th>
                  <Th>Assigned to</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-sand/40">
                    <Td className="font-medium text-ink">
                      <Link href={`/admin/enquiries/${row.id}`} className="hover:text-brass-deep">
                        {row.enquiryId}
                      </Link>
                    </Td>
                    <Td>{formatDateTime(row.createdAt)}</Td>
                    <Td>
                      <p className="font-medium text-ink">{row.customerName}</p>
                      <p className="text-[0.75rem] text-fog">{formatMobile(row.mobileNumber)}</p>
                    </Td>
                    <Td>{row.enquiryType}</Td>
                    <Td>{row.roomType?.name ?? "—"}</Td>
                    <Td>
                      <Badge tone={row.finalStatus === ENQUIRY_STATUS.NEW ? "warn" : row.finalStatus === ENQUIRY_STATUS.CONVERTED ? "success" : row.finalStatus === ENQUIRY_STATUS.LOST || row.finalStatus === ENQUIRY_STATUS.CLOSED ? "muted" : "neutral"}>
                        {ENQUIRY_STATUS_LABELS[row.finalStatus as keyof typeof ENQUIRY_STATUS_LABELS]}
                      </Badge>
                    </Td>
                    <Td>{row.assignedStaff?.name ?? <span className="text-fog">Unassigned</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}