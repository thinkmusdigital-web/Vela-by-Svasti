import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description:
    "About Vela by Svasti — a contemporary lifestyle hotel at VIP Chowk, Raipur, Chhattisgarh, with 70+ rooms, dining, wellness, rooftop pool and event spaces.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const body = await getContentValue(
    "home.about_body",
    "Vela by Svasti is a contemporary lifestyle hospitality destination at VIP Chowk, Raipur, Chhattisgarh.",
  );

  const facilities = [
    "70+ rooms",
    "Fine dining restaurant",
    "Café",
    "Premium bar",
    "Spa",
    "Gym",
    "Rooftop swimming pool",
    "Banquet & event facilities",
  ];

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Vela by Svasti"
        intro="Stay in the Moment — a contemporary lifestyle hotel at VIP Chowk, Raipur, Chhattisgarh."
        image="/images/hotel-exterior.jpg"
        imageAlt="About Vela by Svasti"
      />

      <section className="bg-cream" aria-label="About Vela by Svasti">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow">Time Well Spent</p>
            <div className="mt-6 max-w-prose space-y-5 whitespace-pre-line text-[1.02rem] leading-relaxed text-stone">
              {body}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/enquire" className="btn-primary">
                Enquire Now
              </Link>
              <Link href="/rooms" className="btn-outline">
                Explore Rooms
              </Link>
            </div>
          </div>

          <aside className="border border-line bg-sand p-8 lg:self-start">
            <p className="eyebrow">Under one roof</p>
            <ul className="mt-6 space-y-3 border-t border-line pt-6">
              {facilities.map((facility) => (
                <li key={facility} className="flex items-start gap-3 text-[0.98rem] text-ink">
                  <span className="mt-[7px] h-px w-4 shrink-0 bg-brass" aria-hidden="true" />
                  {facility}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="relative bg-espresso" aria-label="Vela concept image">
        <div className="relative min-h-[420px]">
          <div className="absolute inset-0">
            <MediaImage src="/images/hotel-corridor.jpg" alt="The Vela by Svasti concept" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/30" />
          </div>
          <div className="shell relative z-10 flex min-h-[420px] items-center">
            <div className="max-w-lg">
              <p className="eyebrow text-brass">The idea</p>
              <p className="display mt-4 text-[clamp(1.8rem,4vw,3rem)] italic text-cream">
                “Stay, dine, meet, unwind, recharge, celebrate — time well spent, at Vela.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
