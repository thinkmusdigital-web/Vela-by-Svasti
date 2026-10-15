import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaImage } from "@/components/site/MediaImage";
import { CtaBand } from "@/components/site/CtaBand";
import { TextEffect } from "@/components/core/text-effect";
import { formatDay } from "@/lib/format";
import { prisma } from "@/lib/db";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({ where: { slug } });
  if (!offer || !offer.active) return { title: "Offer not found" };
  return {
    title: offer.name,
    description: offer.description,
    alternates: { canonical: `/offers/${offer.slug}` },
  };
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { roomType: { select: { name: true } } },
  });

  if (!offer || !offer.active) notFound();

  const expired = offer.validUntil && offer.validUntil < new Date();

  return (
    <>
      <header className="bg-sand">
        <div className="shell pt-16 pb-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link href="/offers" className="eyebrow hover:text-ink">
              ← Offers
            </Link>
          </nav>
          <h1 className="display max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">
            <TextEffect per="char" stagger={16}>
              {offer.name}
            </TextEffect>
          </h1>
          {(offer.validFrom || offer.validUntil) && (
            <p className="mt-4 text-[0.8rem] uppercase tracking-[0.18em] text-fog">
              {offer.validFrom ? `From ${formatDay(offer.validFrom)}` : ""}
              {offer.validFrom && offer.validUntil ? " · " : ""}
              {offer.validUntil ? `Until ${formatDay(offer.validUntil)}` : ""}
              {expired && " · Expired"}
            </p>
          )}
        </div>
      </header>

      <section className="bg-cream" aria-label={`${offer.name} details`}>
        <div className="shell grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr] lg:py-20">
          <div>
            <div className="relative aspect-[16/9] overflow-hidden">
              <MediaImage
                src={offer.imageUrl || "/images/hotel-exterior.jpg"}
                alt={offer.name}
                sizes="(min-width: 1400px) 775px, (min-width: 1024px) calc((100vw - 112px) * 0.6), 100vw"
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="mt-10 max-w-3xl">
              <p className="eyebrow mb-4">Details</p>
              <div className="whitespace-pre-line text-[1rem] leading-relaxed text-stone">
                {offer.description}
              </div>
              {offer.terms && (
                <>
                  <p className="eyebrow mb-3 mt-10">Terms</p>
                  <div className="whitespace-pre-line text-[0.9rem] leading-relaxed text-stone">
                    {offer.terms}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-sand p-7">
              <p className="eyebrow">At a glance</p>
              <dl className="mt-5 space-y-4">
                {offer.roomType && (
                  <div>
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fog">Applicable room</dt>
                    <dd className="mt-1 text-[0.98rem] font-medium text-ink">{offer.roomType.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-fog">Availability</dt>
                  <dd className="mt-1 text-[0.98rem] font-medium text-ink">
                    {offer.validUntil ? formatDay(offer.validUntil) : "Ongoing"}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-[0.85rem] leading-relaxed text-stone">
                Offers are confirmed and applied personally by our team — no automatic discounts are
                applied on this website.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/enquire" className="btn-primary w-full">
                  Enquire Now
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
