import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, "gallery.manage")) redirect("/admin");

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, alt: true, category: true, url: true, sortOrder: true, active: true },
  });

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Gallery"
        description="Upload real photography and arrange it for the public gallery. Hidden images are kept but not shown."
      />
      <GalleryManager images={images} />
    </>
  );
}