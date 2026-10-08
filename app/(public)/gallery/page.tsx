import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { getContentValue } from "@/lib/content";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A look inside Vela by Svasti — rooms, restaurant, café, bar, spa, gym, rooftop pool, events and interiors at VIP Chowk, Raipur.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const intro = await getContentValue(
    "gallery.intro",
    "A look around the property — add images from Admin → Gallery.",
  );

  const gallery = await prisma.galleryImage.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHero eyebrow="Gallery" title="A look around" intro={intro} />
      <section className="bg-cream" aria-label="Gallery">
        <div className="shell py-14 lg:py-20">
          {gallery.length > 0 ? (
            <GalleryGrid
              images={gallery.map((image) => ({
                id: image.id,
                title: image.title,
                alt: image.alt,
                category: image.category,
                url: image.url,
              }))}
            />
          ) : (
            <div className="border border-line bg-sand p-12 text-center">
              <p className="display text-3xl text-ink">Gallery is being assembled</p>
              <p className="mx-auto mt-4 max-w-md text-[0.95rem] text-stone">
                Images will appear here as they are added from Admin → Gallery.
              </p>
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}