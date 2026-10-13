import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Wellness",
  description:
    "Spa and gym at Vela by Svasti, VIP Chowk, Raipur — wellbeing as part of the stay. Enquire for services and timings.",
  alternates: { canonical: "/wellness" },
};

export default async function WellnessPage() {
  const [spaBody, gymBody] = await Promise.all([
    getContentValue("wellness.spa_body", ""),
    getContentValue("wellness.gym_body", ""),
  ]);

  const areas = [
    {
      eyebrow: "Spa",
      title: "Slow down on purpose",
      body: spaBody,
      image: "/images/spa.svg",
      alt: "Spa at Vela by Svasti",
    },
    {
      eyebrow: "Gym",
      title: "Keep the routine",
      body: gymBody,
      image: "/images/gym.svg",
      alt: "Gym at Vela by Svasti",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Wellness"
        title="Restore & recharge"
        intro="Between the spa and the gym, Vela makes space for you to slow down or stay strong — whatever your day needs."
        image="/images/spa.svg"
        imageAlt="Wellness at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Wellness facilities">
        <div className="shell space-y-20 py-16 lg:space-y-28 lg:py-24">
          {areas.map((area, index) => (
            <div
              key={area.eyebrow}
              className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative">
                <div
                  aria-hidden="true"
                  className={`absolute -z-0 h-[86%] w-[86%] border border-brass/30 ${index % 2 === 1 ? "-right-4 top-4" : "-left-4 bottom-4"}`}
                />
                <div className="relative aspect-[4/3] overflow-hidden bg-espresso">
                  <MediaImage
                    src={area.image}
                    alt={area.alt}
                    sizes="(min-width: 1400px) 640px, (min-width: 1024px) calc((100vw - 128px) / 2), 100vw"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent"
                  />
                </div>
              </div>
              <div>
                <SectionHeading eyebrow={area.eyebrow} title={area.title} body={area.body} />
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

      <CtaBand />
    </>
  );
}
