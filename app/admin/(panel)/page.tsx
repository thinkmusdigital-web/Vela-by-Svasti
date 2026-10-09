import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { navItemsForUser } from "@/lib/admin-nav";
import { prisma } from "@/lib/db";
import { StatCard, Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/**
 * Admin landing page. Website enquiries now live in Google Sheets, so this
 * dashboard summarises the content the database still owns (rooms, offers,
 * gallery, copy) and links to the sections the signed-in user can manage.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "dashboard.view")) redirect("/admin/login");

  const [roomTypeCount, roomCount, activeOfferCount, galleryCount, contentCount, userCount] =
    await Promise.all([
      prisma.roomType.count(),
      prisma.room.count(),
      prisma.offer.count({ where: { active: true } }),
      prisma.galleryImage.count(),
      prisma.websiteContent.count(),
      prisma.user.count(),
    ]);

  const quickLinks = navItemsForUser(user).filter((item) => item.href !== "/admin");

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Website content managed from this panel. Customer enquiries are delivered to Google Sheets."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Content summary">
        <StatCard label="Room types" value={roomTypeCount} sub={`${roomCount} individual rooms`} />
        <StatCard label="Gallery images" value={galleryCount} sub="Across all categories" />
        <StatCard label="Active offers" value={activeOfferCount} sub="Published on the website" tone="brand" />
        <StatCard label="Content entries" value={contentCount} sub="Editable website copy" />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Manage</p>
          {quickLinks.length === 0 ? (
            <p className="mt-4 text-[0.85rem] text-stone">You do not have access to any content modules.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border border-line bg-cream px-4 py-3 text-[0.9rem] font-medium text-ink transition-colors hover:border-brass-deep hover:text-brass-deep"
                  >
                    {item.label}
                    <span className="mt-0.5 block text-[0.72rem] font-normal uppercase tracking-[0.16em] text-fog">
                      {item.group}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Enquiries</p>
          <p className="mt-4 text-[0.88rem] leading-relaxed text-stone">
            New customer enquiries are stored in the connected Google Sheet and are no longer shown in
            this panel.
          </p>
          <p className="mt-4 text-[0.78rem] text-fog">Staff accounts: {userCount}</p>
        </Card>
      </div>
    </>
  );
}
