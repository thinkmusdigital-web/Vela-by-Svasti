import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { getContactDetails, getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Location",
  description:
    "Vela by Svasti is located at VIP Chowk, Raipur, Chhattisgarh. Get directions and reach us easily.",
  alternates: { canonical: "/location" },
};

export default async function LocationPage() {
  const [contact, body] = await Promise.all([
    getContactDetails(),
    getContentValue(
      "location.page_body",
      "Vela by Svasti is at VIP Chowk, Raipur, Chhattisgarh — easy to reach and easy to find.",
    ),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Location"
        title="VIP Chowk, Raipur"
        intro={body}
        image="/images/location.svg"
        imageAlt="Vela by Svasti at VIP Chowk, Raipur"
      />

      <section className="bg-cream" aria-label="Finding Vela">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-24">
          <div>
            <p className="eyebrow">Getting Here</p>
            <address className="mt-6 text-[1.05rem] not-italic leading-relaxed text-ink">
              {contact.address}
            </address>
            <div className="mt-6 space-y-3">
              {contact.phone && (
                <p>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-underline text-ink">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.email && (
                <p>
                  <a href={`mailto:${contact.email}`} className="link-underline text-ink">
                    {contact.email}
                  </a>
                </p>
              )}
              <p>
                <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
                  Get Directions on Google Maps
                </a>
              </p>
            </div>
            <p className="mt-8 max-w-sm border-l-2 border-brass pl-5 text-[0.85rem] leading-relaxed text-fog">
              Exact map coordinates and nearby landmarks will be published once approved.
            </p>
            <Link href="/enquire" className="btn-primary mt-8 inline-flex">
              Enquire Now
            </Link>
          </div>

          <div>
            {contact.mapEmbedUrl ? (
              <div className="aspect-[4/3] overflow-hidden border border-line">
                <iframe
                  src={contact.mapEmbedUrl}
                  title="Map — Vela by Svasti, VIP Chowk, Raipur"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden border border-line bg-sand">
                <MediaImage src="/images/location.svg" alt="Vela by Svasti — VIP Chowk, Raipur" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-ink/85 p-5">
                  <p className="text-[0.85rem] text-cream">
                    A Google Map will appear here once the embed link is added in Admin → Website
                    Content (contact.mapEmbedUrl).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}