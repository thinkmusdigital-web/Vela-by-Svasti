import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { parseEnquiryFilters, listEnquiries } from "@/lib/enquiry-query";
import { Badge, Card, PageHeader, Th, Td, EmptyState } from "@/components/admin/ui";
import { FilterForm } from "@/components/admin/enquiry-filters";
import {
  ENQUIRY_STATUS,
  ENQUIRY_STATUS_LABELS,
  CALL_STATUS,
  CALL_STATUS_LABELS,
} from "@/lib/constants";
import { formatDay, formatDateTime, formatMobile, relativeDay } from "@/lib/format";

export const dynamic = "force-dynamic";

interface SearchProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EnquiriesPage({ searchParams }: SearchProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const canViewAll = can(user, "enquiry.viewAll");
  const canViewAssigned = can(user, "enquiry.viewAssigned");
  if (!canViewAll && !canViewAssigned) redirect("/admin");

  const params = await searchParams;
  const filters = parseEnquiryFilters(params);
  const scope = { all: canViewAll, userId: user.id };
  const result = await listEnquiries(filters, scope);

  const staff = canViewAll
    ? await prisma.user.findMany({
        where: { active: true, role: { name: { in: ["SUPER_ADMIN", "HOTEL_MANAGER", "RESERVATION_STAFF", "SALES_STAFF"] } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  const pageNumbers: number[] = [];
  const start = Math.max(1, result.page - 2);
  const end = Math.min(result.pageCount, start + 4);
  for (let i = start; i <= end; i += 1) pageNumbers.push(i);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value !== undefined) {
      query.append(key, value);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Enquiries"
        description="Every enquiry that arrives through the website, the desk or the phone, in one place."
        actions={
          result.total > 0 ? (
            <a href={`/api/enquiries/export?${query.toString()}`} className="btn-primary px-6 py-3">
              Export to Excel
            </a>
          ) : undefined
        }
      />

      <FilterForm
        filters={filters}
        staff={staff}
        showStaffFilter={canViewAll}
      />

      {result.rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No enquiries match"
            body="Try clearing the filters above, or export nothing for now. New website enquiries appear here instantly."
          />
        </div>
      ) : (
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/60">
              <tr>
                <Th>Enquiry</Th>
                <Th>Received</Th>
                <Th>Customer</Th>
                <Th>Type</Th>
                <Th>Stay</Th>
                <Th>Status</Th>
                <Th>Call</Th>
                <Th>Follow-up</Th>
                <Th>Assigned to</Th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-sand/40">
                  <Td className="font-medium text-ink">
                    <Link href={`/admin/enquiries/${row.id}`} className="hover:text-brass-deep">
                      {row.enquiryId}
                    </Link>
                    {row.isPossibleDuplicate && (
                      <span className="mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-wide text-amber-700">
                        Possible duplicate
                      </span>
                    )}
                  </Td>
                  <Td>{formatDateTime(row.createdAt)}</Td>
                  <Td>
                    <p className="font-medium text-ink">{row.customerName}</p>
                    <p className="text-[0.75rem] text-fog">{formatMobile(row.mobileNumber)}</p>
                  </Td>
                  <Td>{row.enquiryType}</Td>
                  <Td>
                    {row.checkInDate ? (
                      <>
                        <p>{formatDay(row.checkInDate)}</p>
                        <p className="text-[0.75rem] text-fog">{formatDay(row.checkOutDate)}</p>
                      </>
                    ) : row.enquiryType === "STAY" ? (
                      <span className="text-fog">Dates not set</span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <Badge tone={row.finalStatus === ENQUIRY_STATUS.NEW ? "warn" : row.finalStatus === ENQUIRY_STATUS.CONVERTED ? "success" : row.finalStatus === ENQUIRY_STATUS.LOST || row.finalStatus === ENQUIRY_STATUS.CLOSED ? "muted" : "neutral"}>
                      {ENQUIRY_STATUS_LABELS[row.finalStatus as keyof typeof ENQUIRY_STATUS_LABELS]}
                    </Badge>
                  </Td>
                  <Td>
                    <span className={row.callStatus === CALL_STATUS.PENDING_CALL ? "text-amber-700" : row.callStatus === CALL_STATUS.NOT_INTERESTED ? "text-fog" : "text-ink"}>
                      {CALL_STATUS_LABELS[row.callStatus as keyof typeof CALL_STATUS_LABELS]}
                    </span>
                  </Td>
                  <Td>
                    {row.followUpDate ? (
                      <span className={relativeDay(row.followUpDate) === "Overdue" ? "font-semibold text-red-700" : "text-stone"}>
                        {relativeDay(row.followUpDate)}
                      </span>
                    ) : (
                      <span className="text-fog">—</span>
                    )}
                  </Td>
                  <Td>
                    {row.assignedStaff?.name ?? <span className="text-fog">Unassigned</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[0.8rem] text-stone">
            <p>
              {result.total} enquiry{result.total === 1 ? "" : "s"} · page {result.page} of {result.pageCount}
            </p>
            <div className="flex items-center gap-1">
              {pageNumbers.map((page) => {
                const linkParams = new URLSearchParams(query);
                linkParams.set("page", String(page));
                const active = page === result.page;
                return (
                  <Link
                    key={page}
                    href={`/admin/enquiries?${linkParams.toString()}`}
                    className={`h-8 w-8 items-center justify-center border text-[0.8rem] ${
                      active ? "border-ink bg-ink text-cream" : "border-line bg-white text-stone hover:border-ink"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}