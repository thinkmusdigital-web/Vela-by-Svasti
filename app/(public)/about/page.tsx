import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

function FacilityIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

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
  ] as const;

  const facilityIcons: Record<(typeof facilities)[number], ReactNode> = {
    "70+ rooms": (
      <>
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </>
    ),
    "Fine dining restaurant": (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </>
    ),
    "Café": (
      <>
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <path d="M6 1v3" />
        <path d="M10 1v3" />
        <path d="M14 1v3" />
      </>
    ),
    "Premium bar": (
      <>
        <path d="M4 3h16L12 12Z" />
        <path d="M12 12v8" />
        <path d="M8 20h8" />
      </>
    ),
    "Spa": (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </>
    ),
    "Gym": (
      <>
        <path d="M3 9v6" />
        <path d="M6 7v10" />
        <path d="M18 7v10" />
        <path d="M21 9v6" />
        <path d="M6 12h12" />
      </>
    ),
    "Rooftop swimming pool": (
      <>
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
      </>
    ),
    "Banquet & event facilities": (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
  };

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
                  <span className="mt-[3px] shrink-0 text-brass" aria-hidden="true">
                    <FacilityIcon>{facilityIcons[facility]}</FacilityIcon>
                  </span>
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
