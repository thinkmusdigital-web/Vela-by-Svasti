import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/constants";
import { getContentValue } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Banquets",
  description:
    "Weddings, corporate events, conferences, birthdays and private events at Vela by Svasti, VIP Chowk, Raipur. Plan your occasion with our events team.",
  alternates: { canonical: "/events" },
};

const EVENT_DESCRIPTIONS: Record<string, string> = {
  WEDDING: "Full celebrations, from intimate to grand.",
  CORPORATE: "Offsites, launches, annual days and client evenings.",
  CONFERENCE: "Conferences, seminars and town halls.",
  BIRTHDAY: "Personal, styled celebrations for every age.",
  ANNIVERSARY: "Milestones worth marking well.",
  SOCIAL_GATHERING: "Dinners, reunions and friendly evenings.",
  PRIVATE_EVENT: "Quiet calendar, fully yours.",
};

export default async function EventsPage() {
  const body = await getContentValue(
    "events.page_body",
    "From weddings and anniversaries to conferences and private gatherings — share the occasion and our events team will call you back.",
  );

  const roomTypes: { id: string; name: string; slug: string }[] = []; // Deferred until a database is provisioned.

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Occasions, celebrated"
        intro={body}
        image="/images/hotel-events.jpg"
        imageAlt="Banquet and events at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Event types">
        <div className="shell py-16 lg:py-20">
          <p className="eyebrow mb-8">Choose your occasion</p>
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {EVENT_TYPES.map((type) => (
              <li key={type} className="group bg-cream">
                <Link
                  href={`/enquire?type=event&event=${type}`}
                  className="flex h-full flex-col p-7 transition-colors group-hover:bg-sand"
                >
                  <p className="font-display text-2xl text-ink group-hover:text-brass-deep">
                    {EVENT_TYPE_LABELS[type]}
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-stone">
                    {EVENT_DESCRIPTIONS[type] ?? "Plan it with our team."}
                  </p>
                  <span className="mt-auto pt-5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                    Event Enquiry →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="enquire" className="bg-sand" aria-labelledby="event-enquiry-heading">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr] lg:py-24">
          <EnquiryForm
            enquiryType="EVENT"
            roomTypes={roomTypes}
            heading="Send an event enquiry"
            intro="Tell us the occasion, the expected guest count and your preferred date — our events team will call you back with options."
          />
          <aside>
            <h2 id="event-enquiry-heading" className="display text-3xl text-ink">
              How events come together
            </h2>
            <ol className="mt-8 space-y-6 border-t border-line pt-6">
              {[
                ["Share the brief", "Occasion, date, guest count, ideas."],
                ["We call you", "Options for setup, food and flow."],
                ["Lock the details", "Menu, layout and quote, confirmed personally."],
              ].map(([title, body]) => (
                <li key={title}>
                  <p className="font-display text-xl text-ink">{title}</p>
                  <p className="mt-1 text-[0.92rem] leading-relaxed text-stone">{body}</p>
                </li>
              ))}
            </ol>
            <div className="relative mt-10 aspect-[16/10] overflow-hidden">
              <MediaImage src="/images/hotel-events.jpg" alt="Event space at Vela by Svasti" sizes="(min-width: 1400px) 495px, (min-width: 1024px) calc((100vw - 112px) * 0.385), 100vw" className="h-full w-full object-cover" />
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
