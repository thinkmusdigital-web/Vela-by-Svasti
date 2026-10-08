import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { formatDay } from "@/lib/format";
import { getContentValue } from "@/lib/content";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Current offers at Vela by Svasti, VIP Chowk, Raipur. View details and enquire for availability.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage() {
  const body = await getContentValue(
    "home.offers_body",
    "Seasonal offers and value-added stays, published here as they become available.",
  );

  const offers = await prisma.offer.findMany({
    where: {
      active: true,
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { roomType: { select: { name: true } } },
  });

  return (
    <>
      <PageHero eyebrow="Offers" title="Value, thoughtfully added" intro={body} />
      <section className="bg-cream" aria-label="Offers">
        <div className="shell py-14 lg:py-20">
          {offers.length > 0 ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <li key={offer.id}>
                  <article className="flex h-full flex-col border border-line bg-white">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <MediaImage
                        src={offer.imageUrl || "/images/gallery-exterior.svg"}
                        alt={offer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="display text-2xl text-ink">{offer.name}</p>
                      {(offer.validFrom || offer.validUntil) && (
                        <p className="mt-1 text-[0.78rem] uppercase tracking-[0.16em] text-fog">
                          {offer.validFrom ? `From ${formatDay(offer.validFrom)}` : ""}
                          {offer.validFrom && offer.validUntil ? " · " : ""}
                          {offer.validUntil ? `Until ${formatDay(offer.validUntil)}` : ""}
                        </p>
                      )}
                      {offer.roomType && (
                        <p className="mt-1 text-[0.78rem] uppercase tracking-[0.16em] text-brass-deep">
                          Applicable to {offer.roomType.name}
                        </p>
                      )}
                      <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-stone">
                        {offer.description}
                      </p>
                      <div className="mt-6 flex gap-3">
                        <Link href={`/offers/${offer.slug}`} className="btn-outline flex-1 px-4 py-2.5">
                          View Details
                        </Link>
                        <Link href="/enquire" className="btn-primary flex-1 px-4 py-2.5">
                          Enquire Now
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-line bg-sand p-12 text-center">
              <p className="display text-3xl text-ink">New offers are on the way</p>
              <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-stone">
                Our current offers will be listed here. Send an enquiry and our team will share what’s
                available for your dates.
              </p>
              <div className="mt-8">
                <Link href="/enquire" className="btn-primary">
                  Enquire Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}