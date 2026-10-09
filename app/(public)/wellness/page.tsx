import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
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
      body:
        spaBody ||
        "Signature therapies, steam and stone rituals in a calm, candle-lit space made for switching off.",
      image: "/images/spa.svg",
      alt: "Spa at Vela by Svasti",
      features: ["Signature therapies", "Steam & sauna", "Couples suite"],
      tagline: "Steam · Stone · Stillness",
    },
    {
      eyebrow: "Gym",
      title: "Keep the routine",
      body:
        gymBody ||
        "A focused training floor with the equipment to keep your routine alive, even mid-trip.",
      image: "/images/gym.svg",
      alt: "Gym at Vela by Svasti",
      features: ["Cardio zone", "Strength floor", "Personal training"],
      tagline: "Strength · Cardio · Focus",
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
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent"
                  />
                  <span className="absolute left-4 top-4 border border-cream/35 bg-ink/40 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur-sm">
                    {area.eyebrow}
                  </span>
                  <span
                    aria-hidden="true"
                    className="display absolute bottom-2 right-4 text-3xl text-cream/25"
                  >
                    0{index + 1}
                  </span>
                </div>
              </div>
              <div>
                <p className="eyebrow text-brass">{area.eyebrow}</p>
                <h2 className="h-section mt-3 text-ink">{area.title}</h2>
                {area.body && (
                  <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-stone">
                    {area.body}
                  </p>
                )}
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {area.features.map((feature) => (
                    <li
                      key={feature}
                      className="border border-line bg-white/60 px-3.5 py-2 text-[0.82rem] font-medium text-stone"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link href="/enquire" className="btn-primary">
                    Enquire Now
                  </Link>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-fog">
                    {area.tagline}
                  </span>
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