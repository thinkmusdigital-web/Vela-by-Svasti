import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";
import { wellnessSpaSlides, wellnessGymSlides } from "@/lib/wellness-images";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Wellness",
  description:
    "Spa and gym at Vela by Svasti, VIP Chowk, Raipur — wellbeing as part of the stay. Enquire for services and timings.",
  alternates: { canonical: "/wellness" },
};

const sliderSizes =
  "(min-width: 1400px) 745px, (min-width: 1024px) calc((100vw - 128px) * 0.5833), 100vw";

export default async function WellnessPage() {
  const [spaBody, gymBody] = await Promise.all([
    getContentValue("wellness.spa_body", ""),
    getContentValue("wellness.gym_body", ""),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Wellness"
        title="Restore & recharge"
        intro="Between the spa and the gym, Vela makes space for you to slow down or stay strong — whatever your day needs."
        image="/images/spa-hotel.png"
        imageAlt="A calm spa treatment room inspired by Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Wellness facilities">
        <div className="shell space-y-20 py-16 sm:py-20 lg:space-y-32 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col justify-center lg:col-span-5">
              <SectionHeading eyebrow="Spa" title="Slow down on purpose" body={spaBody} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/enquire" className="btn-primary">
                  Enquire Now
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <ImageCarousel
                label="Spa gallery"
                images={wellnessSpaSlides}
                sizes={sliderSizes}
                className="aspect-[16/10]"
              />
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <ImageCarousel
                label="Gym gallery"
                images={wellnessGymSlides}
                sizes={sliderSizes}
                className="aspect-[16/10]"
              />
            </div>
            <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-5">
              <SectionHeading eyebrow="Gym" title="Keep the routine" body={gymBody} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/enquire" className="btn-primary">
                  Enquire Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
