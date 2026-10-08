import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getEnquiryForUser } from "@/lib/enquiry-access";
import { prisma } from "@/lib/db";
import { EnquiryWorkspace } from "@/components/admin/enquiry-workspace";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import {
  ENQUIRY_STATUS_LABELS,
  CALL_STATUS_LABELS,
  PREFERRED_CONTACT_LABELS,
  PURPOSE_LABELS,
} from "@/lib/constants";
import { formatDay, formatMobile } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function field(order: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 border-t border-line py-2.5 text-[0.85rem]">
      <dt className="font-semibold text-fog">{order.label}</dt>
      <dd className="text-ink">{order.value}</dd>
    </div>
  );
}

export default async function EnquiryDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "enquiry.viewAll") && !can(user, "enquiry.viewAssigned")) redirect("/admin");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const { enquiry, forbidden } = await getEnquiryForUser(id, user);
  if (forbidden) redirect("/admin/enquiries");
  if (!enquiry) notFound();

  const activityLogs = await prisma.enquiryActivityLog.findMany({
    where: { enquiryId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, action: true, oldValue: true, newValue: true, userLabel: true, createdAt: true },
  });

  const staff = can(user, "enquiry.manage")
    ? await prisma.user.findMany({
        where: { active: true, role: { name: { in: ["SUPER_ADMIN", "HOTEL_MANAGER", "RESERVATION_STAFF", "SALES_STAFF"] } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  const duplicates = await prisma.enquiry.findMany({
    where: {
      deletedAt: null,
      id: { not: enquiry.id },
      OR: [{ mobileNumber: enquiry.mobileNumber }, { email: enquiry.email }],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, enquiryId: true, customerName: true, createdAt: true },
  });

  const phoneDigits = enquiry.mobileNumber.replace(/\D/g, "");
  const callHref = phoneDigits ? `tel:+91${phoneDigits}` : undefined;
  const waHref = phoneDigits ? `https://wa.me/91${phoneDigits}` : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Enquiries"
        title={enquiry.enquiryId}
        description={`Received ${new Date(enquiry.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
        actions={
          <>
            {callHref && (
              <a href={callHref} className="btn-primary px-6 py-3">
                Call {formatMobile(enquiry.mobileNumber)}
              </a>
            )}
            {waHref && (
              <a href={`${waHref}?text=${encodeURIComponent(`Hello, this is Vela by Svasti. You enquired with us on ${formatDay(enquiry.createdAt)} (${enquiry.enquiryId}).`)}`} className="btn-outline px-6 py-3">
                WhatsApp
              </a>
            )}
            <a href={`mailto:${enquiry.email}`} className="btn-outline px-6 py-3">
              Email
            </a>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone={enquiry.finalStatus === "NEW" ? "warn" : enquiry.finalStatus === "CONVERTED" ? "success" : enquiry.finalStatus === "LOST" || enquiry.finalStatus === "CLOSED" ? "muted" : "neutral"}>
          {ENQUIRY_STATUS_LABELS[enquiry.finalStatus as keyof typeof ENQUIRY_STATUS_LABELS]}
        </Badge>
        <Badge tone="neutral">{CALL_STATUS_LABELS[enquiry.callStatus as keyof typeof CALL_STATUS_LABELS]}</Badge>
        <Badge tone="brand">{enquiry.enquiryType}</Badge>
        {enquiry.isPossibleDuplicate && <Badge tone="warn">Possible duplicate</Badge>}
        <Link href="/admin/enquiries" className="link-underline text-[0.8rem]">← Back to list</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Details</p>
            <dl className="mt-3">
              {field({ label: "Full name", value: enquiry.customerName })}
              {field({ label: "Mobile", value: formatMobile(enquiry.mobileNumber) })}
              {field({ label: "Email", value: enquiry.email })}
              {field({
                label: "Room type",
                value: enquiry.roomType?.name ?? (enquiry.enquiryType === "STAY" ? "Not specified" : "—"),
              })}
              {enquiry.enquiryType === "STAY" && (
                <>
                  {field({
                    label: "Check-in / out",
                    value: (
                      <>
                        {formatDay(enquiry.checkInDate)} → {formatDay(enquiry.checkOutDate)}
                      </>
                    ),
                  })}
                  {field({
                    label: "No. of rooms",
                    value: enquiry.numberOfRooms,
                  })}
                  {field({
                    label: "Guests",
                    value: `${enquiry.adults} adult${enquiry.adults === 1 ? "" : "s"}${enquiry.children ? `, ${enquiry.children} child${enquiry.children === 1 ? "" : "ren"}` : ""}`,
                  })}
                  {field({
                    label: "Purpose",
                    value: enquiry.purposeOfStay ? (PURPOSE_LABELS[enquiry.purposeOfStay] ?? enquiry.purposeOfStay) : "—",
                  })}
                </>
              )}
              {enquiry.enquiryType === "EVENT" && (
                <>
                  {field({ label: "Company", value: enquiry.companyName ?? "—" })}
                  {field({ label: "Event", value: enquiry.eventType ?? "—" })}
                  {field({ label: "Expected guests", value: enquiry.expectedGuests ?? "—" })}
                  {field({ label: "Budget", value: enquiry.approximateBudget ?? "—" })}
                </>
              )}
              {field({
                label: "Preferred contact",
                value: PREFERRED_CONTACT_LABELS[enquiry.preferredContact as keyof typeof PREFERRED_CONTACT_LABELS] ?? enquiry.preferredContact,
              })}
              {field({ label: "Preferred call time", value: enquiry.preferredCallTime ?? "—" })}
              {field({ label: "Source", value: enquiry.source })}
              {enquiry.specialRequest && field({ label: "Special request", value: enquiry.specialRequest })}
            </dl>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <EnquiryWorkspace
            enquiry={serializeEnquiry(enquiry)}
            staff={staff}
            duplicates={duplicates.map((d) => ({
              id: d.id,
              enquiryId: d.enquiryId,
              customerName: d.customerName,
              createdAt: d.createdAt.toISOString(),
            }))}
            activityLogs={activityLogs.map((log) => ({
              id: log.id,
              action: log.action,
              oldValue: log.oldValue,
              newValue: log.newValue,
              userLabel: log.userLabel,
              createdAt: log.createdAt.toISOString(),
            }))}
            canManage={can(user, "enquiry.manage")}
          />
        </div>
      </div>
    </>
  );
}

function serializeEnquiry(enquiry: NonNullable<Awaited<ReturnType<typeof getEnquiryForUser>>["enquiry"]>) {
  return {
    id: enquiry.id,
    enquiryId: enquiry.enquiryId,
    enquiryType: enquiry.enquiryType,
    customerName: enquiry.customerName,
    mobileNumber: enquiry.mobileNumber,
    email: enquiry.email,
    checkInDate: toDay(enquiry.checkInDate),
    checkOutDate: toDay(enquiry.checkOutDate),
    numberOfRooms: enquiry.numberOfRooms,
    adults: enquiry.adults,
    children: enquiry.children,
    roomType: enquiry.roomType ?? null,
    finalStatus: enquiry.finalStatus,
    callStatus: enquiry.callStatus,
    followUpDate: toDay(enquiry.followUpDate),
    customerResponse: enquiry.customerResponse,
    remarks: enquiry.remarks,
    quotationAmount: enquiry.quotationAmount,
    lastContactedAt: enquiry.lastContactedAt?.toISOString() ?? null,
    assignedStaffId: enquiry.assignedStaffId,
    assignedStaff: enquiry.assignedStaff ?? null,
    isPossibleDuplicate: enquiry.isPossibleDuplicate,
    duplicateOfId: enquiry.duplicateOfId ?? null,
    followups: enquiry.followups.map((f) => ({
      id: f.id,
      note: f.note,
      followUpDate: toDay(f.followUpDate),
      completedAt: f.completedAt?.toISOString() ?? null,
      createdAt: f.createdAt.toISOString(),
      createdBy: f.createdBy?.name ?? "Website visitor",
    })),
  };
}

function toDay(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}