import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { RoomsManager } from "@/components/admin/rooms-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "rooms.manage")) redirect("/admin");

  const roomTypes = await prisma.roomType.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      amenities: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true, sortOrder: true } },
      rooms: {
        orderBy: { roomNumber: "asc" },
        select: { id: true, roomNumber: true, floor: true, active: true, notes: true },
      },
    },
  });

  const rows = roomTypes.map((type) => ({
    id: type.id,
    name: type.name,
    slug: type.slug,
    shortDescription: type.shortDescription,
    description: type.description,
    sizeSqft: type.sizeSqft,
    bedType: type.bedType,
    maxOccupancy: type.maxOccupancy,
    displayOrder: type.displayOrder,
    active: type.active,
    seoTitle: type.seoTitle,
    seoDescription: type.seoDescription,
    amenities: type.amenities,
    images: type.images,
    rooms: type.rooms,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Rooms & inventory"
        description="Room categories shown on the public site, plus the physical room units that will feed the future booking engine."
      />
      <RoomsManager roomTypes={rows} />
    </>
  );
}