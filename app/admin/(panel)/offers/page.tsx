import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { OffersManager } from "@/components/admin/offers-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "offers.manage")) redirect("/admin");

  const [offers, roomTypes] = await Promise.all([
    prisma.offer.findMany({
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      include: { roomType: { select: { id: true, name: true } } },
    }),
    prisma.roomType.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows = offers.map((offer) => ({
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    description: offer.description,
    imageUrl: offer.imageUrl,
    validFrom: offer.validFrom?.toISOString().slice(0, 10) ?? null,
    validUntil: offer.validUntil?.toISOString().slice(0, 10) ?? null,
    roomType: offer.roomType,
    roomTypeId: offer.roomType?.id ?? "",
    terms: offer.terms,
    active: offer.active,
    sortOrder: offer.sortOrder,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Offers"
        description="Packages and value-added stays. Live offers appear on the public website with natural URLs."
      />
      <OffersManager offers={rows} roomTypes={roomTypes} />
    </>
  );
}