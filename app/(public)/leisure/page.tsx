import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { CtaBand } from "@/components/site/CtaBand";
import { TextEffect } from "@/components/core/text-effect";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Leisure",
  description:
    "Rooftop swimming pool and leisure spaces at Vela by Svasti, VIP Chowk, Raipur. Enquire for access and timings.",
  alternates: { canonical: "/leisure" },
};

export default async function LeisurePage() {
  const body = await getContentValue(
    "leisure.pool_body",
    "A rooftop swimming pool with open views over Raipur.",
  );

  return (
    <>
      <header className="bg-sand">
        <div className="shell pt-16 pb-14 sm:py-20">
          <p className="eyebrow">Leisure</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">
            <TextEffect per="char" stagger={16}>
              Up to the rooftop
            </TextEffect>
          </h1>
        </div>
      </header>

      <section className="relative bg-espresso text-cream" aria-label="Rooftop swimming pool">
        <div className="relative min-h-[70vh]">
          <div className="absolute inset-0">
            <MediaImage src="/images/pool.svg" alt="Rooftop swimming pool at Vela by Svasti" className="h-full w-full object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/20" />
          </div>
          <div className="shell relative z-10 flex min-h-[70vh] items-end py-16">
            <div className="max-w-2xl pb-8">
              <p className="eyebrow mb-4 text-brass">Rooftop Swimming Pool</p>
              <h2 className="display text-[clamp(2rem,5vw,3.4rem)] text-cream">
                <TextEffect inView per="char">
                  Open skies above Raipur
                </TextEffect>
              </h2>
              <p className="mt-5 text-[1.02rem] leading-relaxed text-cream/80">
                <TextEffect inView per="word" stagger={26} delay={100}>
                  {body}
                </TextEffect>
              </p>
              <p className="mt-4 text-[0.85rem] leading-relaxed text-cream/60">
                Pool access, timings and guest policies are confirmed with our team.
              </p>
              <div className="mt-8">
                <Link href="/enquire" className="btn-brass">
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