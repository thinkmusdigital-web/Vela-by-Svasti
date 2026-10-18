import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { getContentValue } from "@/lib/content";
import { PUBLIC_ROOM_TYPES } from "@/lib/room-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rooms",
  description:
    "Explore rooms at Vela by Svasti, VIP Chowk, Raipur — more than 70 rooms for business and leisure stays. Enquire for availability.",
  alternates: { canonical: "/rooms" },
};

export default async function RoomsPage() {
  const intro = await getContentValue(
    "rooms.page_intro",
    "More than 70 rooms across comfortable room types. Choose a room, then enquire for availability.",
  );

  return (
    <>
      <PageHero
        eyebrow="Stay"
        title="Rooms for every kind of stay"
        intro={intro}
        image="/images/hotel-room-teal.jpg"
        imageAlt="Rooms at Vela by Svasti"
      />

      <section className="bg-cream" aria-label="Room types">
        <div className="shell py-16 lg:py-24">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {PUBLIC_ROOM_TYPES.map((room) => (
              <article key={room.id} className="group flex flex-col overflow-hidden rounded-xl border border-brass/30 bg-[#fff9ef] shadow-[0_8px_24px_rgba(79,48,19,0.09)] transition-shadow hover:shadow-[0_14px_32px_rgba(79,48,19,0.16)]">
                <div className="relative aspect-[2/1] overflow-hidden bg-sand">
                  <MediaImage
                    src={room.image}
                    alt={`${room.name} at Vela by Svasti`}
                    sizes="(min-width: 1280px) 390px, (min-width: 640px) calc((100vw - 80px) / 2), 100vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  <span className="absolute left-5 top-5 rounded-full border border-white/45 bg-brass/95 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                    Room type
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h2 className="display text-[1.8rem] text-[#4b2818]">{room.name}</h2>
                  <span className="mt-4 h-px w-20 bg-brass/70" aria-hidden="true" />
                  <p className="mt-4 min-h-14 text-[0.98rem] leading-relaxed text-stone">{room.shortDescription}</p>
                  <div className="mt-4 flex items-center gap-4 border-t border-brass/20 py-4">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-9 w-9 shrink-0 text-brass-deep">
                      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M5 9V6h5a3 3 0 0 1 3 3M3 18v2m18-2v2" />
                    </svg>
                    <div className="h-10 w-px bg-brass/30" />
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-9 w-9 shrink-0 text-brass-deep">
                      <circle cx="9" cy="7" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2" />
                    </svg>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone">Sleeps</p>
                      <p className="mt-0.5 font-display text-lg text-ink">Up to {room.maxOccupancy}</p>
                    </div>
                  </div>
                  <Link href={`/enquire?room=${room.slug}`} className="mt-auto flex w-full items-center justify-center gap-3 rounded-lg border border-brass-deep bg-[#5b2d18] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-ink">
                    Enquire now <span aria-hidden="true" className="text-lg leading-none">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <aside className="mt-7 flex flex-col gap-6 rounded-xl border border-brass/30 bg-[#fff9ef] p-6 shadow-[0_6px_18px_rgba(79,48,19,0.07)] sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brass/10 text-brass-deep">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
                <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
            </div>
            <div className="hidden h-20 w-px bg-brass sm:block" aria-hidden="true" />
            <div>
              <p className="eyebrow text-brass-deep">Availability &amp; rates</p>
              <p className="mt-2 max-w-4xl font-display text-lg leading-relaxed text-stone sm:text-xl">
              Pricing and availability vary by date and are confirmed by our reservations team over
              a call. Use{" "}
              <Link href="/enquire" className="link-underline text-ink">
                Enquire for Availability
              </Link>{" "}
              or{" "}
              <Link href="/enquire" className="link-underline text-ink">
                Request a Stay
              </Link>{" "}
              and we’ll get back to you personally.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
