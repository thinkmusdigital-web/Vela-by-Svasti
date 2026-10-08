import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Experience Vela by Svasti, Raipur — Stay, Dine, Meet, Unwind, Recharge and Celebrate.",
  alternates: { canonical: "/experience" },
};

const PILLARS = [
  { title: "Stay", phrase: "Rest in rooms that feel like a pause.", href: "/rooms" },
  { title: "Dine", phrase: "Gather — restaurant, café and bar.", href: "/dine" },
  { title: "Meet", phrase: "Hold it well. Meetings, conferences, banquets.", href: "/events" },
  { title: "Unwind", phrase: "Treatments at the spa, stillness on purpose.", href: "/wellness" },
  { title: "Recharge", phrase: "The gym, then the rooftop pool.", href: "/leisure" },
  { title: "Celebrate", phrase: "Weddings, anniversaries, private nights.", href: "/events" },
];

export default async function ExperiencePage() {
  const body = await getContentValue(
    "experience.page_body",
    "Vela is built around six simple ways to spend your time.",
  );

  return (
    <>
      <PageHero
        eyebrow="Experience"
        title="Time, well spent"
        intro={body}
        image="/images/experience.svg"
        imageAlt="Experience at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Vela experiences">
        <div className="shell grid gap-x-12 gap-y-10 py-16 md:grid-cols-2 lg:grid-cols-3 lg:py-24">
          {PILLARS.map((pillar, index) => (
            <div key={pillar.title} className="group border-t-2 border-brass bg-sand p-8">
              <p className="font-display text-5xl text-brass/60">{String(index + 1).padStart(2, "0")}</p>
              <p className="display mt-4 text-4xl text-ink">{pillar.title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">{pillar.phrase}</p>
              <Link href={pillar.href} className="mt-6 inline-flex text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-brass-deep hover:text-ink">
                Explore →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink text-cream">
        <div className="shell py-16 text-center lg:py-24">
          <p className="eyebrow text-brass">Make it yours</p>
          <h2 className="display mx-auto mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)] text-cream">
            Tell us what you need — we’ll shape the stay
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1rem] leading-relaxed text-cream/75">
            Rooms, dining, events or a combination — one enquiry covers it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/enquire" className="btn-brass">
              Enquire Now
            </Link>
            <Link href="/events" className="btn-light-outline">
              Plan an Event
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}