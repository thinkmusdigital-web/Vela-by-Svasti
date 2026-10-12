import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/site/MediaImage";
import { CtaBand } from "@/components/site/CtaBand";
import { prisma } from "@/lib/db";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await prisma.roomType.findUnique({ where: { slug } });
  if (!room || !room.active) return { title: "Room not found" };

  return {
    title: room.seoTitle || `${room.name} — Rooms at Vela by Svasti, Raipur`,
    description:
      room.seoDescription ||
      room.shortDescription ||
      `Explore the ${room.name} at Vela by Svasti, VIP Chowk, Raipur. Enquire for availability.`,
    alternates: { canonical: `/rooms/${room.slug}` },
    openGraph: {
      title: `${room.name} — Vela by Svasti, Raipur`,
      description: room.shortDescription,
      url: `/rooms/${room.slug}`,
    },
  };
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const room = await prisma.roomType.findUnique({
    where: { slug },
    include: {
      images: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      amenities: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!room || !room.active) notFound();

  const heroImage = room.images[0] ?? { url: "/images/hotel-room-teal.jpg", alt: room.name };
  const gallery = room.images.length > 1 ? room.images.slice(1) : [];

  const specifications = [
    { label: "Room size", value: room.sizeSqft ? `${room.sizeSqft} sq. ft.` : "To be confirmed" },
    { label: "Bed configuration", value: room.bedType || "To be confirmed" },
    { label: "Occupancy", value: `Up to ${room.maxOccupancy} guests` },
  ];

  return (
    <>
      <header className="bg-sand">
        <div className="shell pt-16 pb-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link href="/rooms" className="eyebrow hover:text-ink">
              ← Stay / Rooms
            </Link>
          </nav>
          <h1 className="display max-w-4xl text-[clamp(2.6rem,6vw,4.5rem)] text-ink">{room.name}</h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-stone">
            {room.shortDescription}
          </p>
        </div>
      </header>

      <section className="bg-cream" aria-label={`${room.name} overview`}>
        <div className="shell grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr] lg:py-20">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <MediaImage
                src={heroImage.url}
                alt={heroImage.alt || room.name}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="mt-12">
              <p className="eyebrow mb-4">About this room</p>
              <div className="max-w-3xl space-y-4 whitespace-pre-line text-[1rem] leading-relaxed text-stone">
                {room.description ||
                  "Details for this room are being finalised. Send an enquiry and our team will share the specifics for your dates."}
              </div>
            </div>

            {room.amenities.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow mb-5">Amenities</p>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 border-t border-line pt-6 sm:grid-cols-2">
                  {room.amenities.map((amenity) => (
                    <li key={amenity.id} className="flex items-start gap-3 text-[0.98rem] text-ink">
                      <span className="mt-[7px] h-px w-4 shrink-0 bg-brass" aria-hidden="true" />
                      {amenity.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow mb-5">Gallery</p>
                <div className="grid grid-cols-2 gap-4">
                  {gallery.map((image, index) => (
                    <div key={image.id} className="relative aspect-[4/3] overflow-hidden">
                      <MediaImage
                        src={image.url}
                        alt={image.alt || `${room.name} view ${index + 2}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-sand p-7">
              <p className="eyebrow">At a glance</p>
              <dl className="mt-5 space-y-4">
                {specifications.map((spec) => (
                  <div key={spec.label} className="border-b border-line pb-3 last:border-0">
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fog">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-[0.98rem] font-medium text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[0.85rem] leading-relaxed text-stone">
                Rates and availability are confirmed personally by our reservations team — no
                instant pricing is shown.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href={`/enquire?room=${room.slug}`} className="btn-primary w-full">
                  Enquire for Availability
                </Link>
                <Link href={`/enquire?room=${room.slug}`} className="btn-outline w-full">
                  Request a Stay
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
