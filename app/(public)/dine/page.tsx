import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dine",
  description:
    "Fine dining, café and premium bar at Vela by Svasti, VIP Chowk, Raipur. Menu and hours are confirmed with our team.",
  alternates: { canonical: "/dine" },
};

export default async function DinePage() {
  const [restaurantBody, cafeBody, barBody] = await Promise.all([
    getContentValue("dine.restaurant_body", ""),
    getContentValue("dine.cafe_body", ""),
    getContentValue("dine.bar_body", ""),
  ]);

  const venues = [
    { eyebrow: "Fine Dining", title: "An unhurried table", body: restaurantBody, image: "/images/hotel-restaurant.jpg", alt: "Fine dining restaurant at Vela" },
    { eyebrow: "Café", title: "Slow mornings", body: cafeBody, image: "/images/hotel-cafe.jpg", alt: "Café at Vela" },
    { eyebrow: "Bar", title: "Evenings, well kept", body: barBody, image: "/images/hotel-bar.jpg", alt: "Premium bar at Vela" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Dine"
        title="Gather at the table"
        intro="Three venues, one goal — shared plates and unhurried conversations. Menu, seating and operating hours are confirmed by our team."
        image="/images/hotel-restaurant.jpg"
        imageAlt="Dining at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Dining venues">
        <div className="shell space-y-20 py-16 lg:space-y-28 lg:py-24">
          {venues.map((venue, index) => (
            <div
              key={venue.eyebrow}
              className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MediaImage src={venue.image} alt={venue.alt} sizes="(min-width: 1400px) 650px, (min-width: 1024px) calc((100vw - 104px) / 2), 100vw" className="h-full w-full object-cover" />
              </div>
              <div>
                <SectionHeading eyebrow={venue.eyebrow} title={venue.title} body={venue.body} />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/enquire" className="btn-primary">
                    Enquire Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-sand">
        <div className="shell py-14 text-center">
          <p className="eyebrow">Menus &amp; Hours</p>
          <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-stone">
            Menu details and operating hours are being finalised and will be published here. For
            reservations and private dining, send an enquiry and our team will assist you.
          </p>
          <div className="mt-8 text-center">
            <Link href="/enquire" className="btn-brass">
              Enquire for Dining
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
