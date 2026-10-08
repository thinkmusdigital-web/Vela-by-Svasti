import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { RoomCard } from "@/components/site/RoomCard";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rooms",
  description:
    "Explore rooms at Vela by Svasti, VIP Chowk, Raipur — more than 70 rooms for business and leisure stays. Enquire for availability.",
  alternates: { canonical: "/rooms" },
};

export default async function RoomsPage() {
  const intro = await getContentValue(
    "rooms.page_intro",
    "More than 70 rooms across comfortable room types. Choose a room, then enquire for availability.",
  );

  const roomTypes = await prisma.roomType.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      images: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Stay"
        title="Rooms for every kind of stay"
        intro={intro}
        image="/images/room-premium.svg"
        imageAlt="Rooms at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Room types">
        <div className="shell py-16 lg:py-24">
          {roomTypes.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-sand p-12 text-center">
              <p className="display text-3xl text-ink">Room types are being finalised</p>
              <p className="mx-auto mt-4 max-w-xl text-[0.98rem] text-stone">
                We’re ready to help plan your stay. Send an enquiry and our reservations team will
                call you back with the options and availability for your dates.
              </p>
              <div className="mt-8">
                <Link href="/enquire" className="btn-primary">
                  Enquire Now
                </Link>
              </div>
            </div>
          )}

          <aside className="mt-14 border border-line bg-sand p-8">
            <p className="eyebrow">Availability &amp; rates</p>
            <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-stone">
              Pricing and availability vary by date and are confirmed by our reservations team over
              a call. Use{" "}
              <Link href="/enquire" className="link-underline text-ink">
                Enquire for Availability
              </Link>{" "}
              or{" "}
              <Link href="/enquire" className="link-underline text-ink">
                Request a Stay
              </Link>{" "}
              and we’ll get back to you personally.
            </p>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}