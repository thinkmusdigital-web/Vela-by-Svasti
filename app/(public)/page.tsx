import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand } from "@/components/site/CtaBand";
import { RoomCard } from "@/components/site/RoomCard";
import { getContentValue, getContentJson, getContactDetails } from "@/lib/content";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export default async function HomePage() {
  const [heroTitle, heroSubtitle, heroKicker, heroImage, aboutTitle, aboutBody, aboutImage,
    stayBody, diningBody, wellnessBody, poolBody, eventsBody, offersBody, experiencesBody,
    testimonials, roomTypes, offers, gallery, contact, concept] = await Promise.all([
    getContentValue("home.hero_title", "Stay in the Moment."),
    getContentValue(
      "home.hero_subtitle",
      "A contemporary lifestyle hotel at VIP Chowk, Raipur — stays, dining, wellness, celebrations and time well spent.",
    ),
    getContentValue("home.hero_kicker", "VIP Chowk · Raipur"),
    getContentValue("home.hero_image", "/images/hero.svg"),
    getContentValue("home.about_title", "About Vela"),
    getContentValue(
      "home.about_body",
      "Vela by Svasti is a contemporary lifestyle hospitality destination at VIP Chowk, Raipur, Chhattisgarh.",
    ),
    getContentValue("home.about_image", "/images/about.svg"),
    getContentValue(
      "home.stay_body",
      "More than 70 rooms designed for rest, focus and ease — choose the space that fits your stay.",
    ),
    getContentValue(
      "home.dining_body",
      "A fine dining restaurant, a relaxed café and a premium bar — three ways to gather at the table.",
    ),
    getContentValue(
      "home.wellness_body",
      "Restore at the spa, keep your routine at the gym — wellbeing is part of the stay.",
    ),
    getContentValue(
      "home.pool_body",
      "Take the day up to the rooftop swimming pool — open skies above Raipur.",
    ),
    getContentValue(
      "home.events_body",
      "Weddings, corporate events, conferences and private gatherings — tell us the occasion.",
    ),
    getContentValue(
      "home.offers_body",
      "Seasonal offers and value-added stays, published here as they become available.",
    ),
    getContentValue(
      "home.experiences_body",
      "Stay, Dine, Meet, Unwind, Recharge, Celebrate — six ways to spend your time well at Vela.",
    ),
    getContentJson<{ quote: string; author: string }[]>("home.testimonials", []),
    prisma.roomType.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
      include: {
        images: { where: { active: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.offer.findMany({
      where: {
        active: true,
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    getContactDetails(),
    getContentValue("brand.concept", "Time Well Spent"),
  ]);

  const experiences = [
    { title: "Stay", href: "/rooms" },
    { title: "Dine", href: "/dine" },
    { title: "Meet", href: "/events" },
    { title: "Unwind", href: "/wellness" },
    { title: "Recharge", href: "/leisure" },
    { title: "Celebrate", href: "/events" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[86svh] items-end bg-ink" aria-label="Welcome to Vela by Svasti">
        <div className="absolute inset-0">
          <MediaImage
            src={heroImage}
            alt="Vela by Svasti — contemporary lifestyle hotel at VIP Chowk, Raipur"
            className="h-full w-full object-cover opacity-80"
            priority
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          >
            <source src="/videos/vela-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/40" />
        </div>
        <div className="shell relative z-10 pb-16 pt-40">
          <Reveal>
            <p className="mb-6 flex items-center gap-4 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass">
              <span className="h-px w-10 bg-brass" aria-hidden="true" />
              {heroKicker}
            </p>
            <h1 className="display max-w-4xl text-[clamp(3rem,9vw,6.5rem)] text-cream">{heroTitle}</h1>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-cream/80">{heroSubtitle}</p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <Link href="/enquire" className="btn-brass w-full sm:w-auto">
                Enquire Now
              </Link>
              <Link href="/rooms" className="btn-light-outline w-full sm:w-auto">
                Explore Rooms
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Concept */}
      <section className="border-b border-line bg-cream" aria-label="Vela concept">
        <div className="shell py-14 text-center sm:py-16">
          <p className="eyebrow">Time Well Spent</p>
          <p className="display mt-4 text-[clamp(1.6rem,3.5vw,2.6rem)] italic text-ink/90">
            “{concept} at {heroKicker.split("·")[1]?.trim() ?? "Raipur"}.”
          </p>
        </div>
      </section>

      {/* About */}
      <section className="bg-sand" aria-labelledby="home-about">
        <div className="shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden">
              <MediaImage
                src={aboutImage}
                alt="About Vela by Svasti"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="Welcome" title={aboutTitle} body={aboutBody} id="home-about" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn-outline">
                More About Vela
              </Link>
              <Link href="/enquire" className="btn-primary">
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stay */}
      <section className="bg-cream" aria-labelledby="home-stay">
        <div className="shell py-20 lg:py-28">
          <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
            <SectionHeading eyebrow="Stay" title="More than 70 rooms" body={stayBody} id="home-stay" />
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/rooms" className="btn-primary">
                Explore Rooms
              </Link>
            </div>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="bg-ink text-cream" aria-labelledby="home-dining">
        <div className="shell py-20 lg:py-28">
          <SectionHeading
            eyebrow="Dine"
            title="Three ways to gather"
            body={diningBody}
            dark
            id="home-dining"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { image: "/images/dining.svg", label: "Fine Dining", body: "An unhurried restaurant experience.", href: "/dine" },
              { image: "/images/cafe.svg", label: "Café", body: "Slow mornings and working lunches.", href: "/dine" },
              { image: "/images/bar.svg", label: "Bar", body: "A premium bar to end the day well.", href: "/dine" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <MediaImage
                    src={item.image}
                    alt={`${item.label} at Vela by Svasti`}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-ink/20" />
                </div>
                <p className="mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-brass">
                  {item.label}
                </p>
                <p className="mt-2 text-[0.95rem] text-cream/75">{item.body}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/dine" className="btn-light-outline">
              Explore Dining
            </Link>
          </div>
        </div>
      </section>

      {/* Wellness */}
      <section className="bg-sand" aria-labelledby="home-wellness">
        <div className="shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="order-2 lg:order-1">
            <SectionHeading eyebrow="Wellness" title="Restore & recharge" body={wellnessBody} id="home-wellness" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="display text-2xl text-ink">Spa</p>
              <p className="display text-2xl text-ink">Gym</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wellness" className="btn-primary">
                Explore Wellness
              </Link>
            </div>
          </div>
          <Reveal className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] overflow-hidden">
                <MediaImage src="/images/spa.svg" alt="Spa at Vela by Svasti" className="h-full w-full object-cover" />
              </div>
              <div className="mt-10 aspect-[3/4] overflow-hidden">
                <MediaImage src="/images/gym.svg" alt="Gym at Vela by Svasti" className="h-full w-full object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Rooftop Pool */}
      <section className="relative bg-espresso text-cream" aria-labelledby="home-pool">
        <div className="relative min-h-[520px]">
          <div className="absolute inset-0">
            <MediaImage src="/images/pool.svg" alt="Rooftop swimming pool at Vela by Svasti" className="h-full w-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/20" />
          </div>
          <div className="shell relative z-10 flex min-h-[520px] items-center py-20">
            <Reveal className="max-w-xl">
              <p className="eyebrow mb-4 text-brass">Leisure</p>
              <h2 id="home-pool" className="display text-[clamp(2.2rem,5vw,3.8rem)] text-cream">
                The rooftop pool
              </h2>
              <p className="mt-5 text-[1.02rem] leading-relaxed text-cream/80">{poolBody}</p>
              <div className="mt-8">
                <Link href="/leisure" className="btn-brass">
                  Explore Leisure
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="bg-cream" aria-labelledby="home-events">
        <div className="shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <SectionHeading eyebrow="Events" title="Occasions, celebrated" body={eventsBody} id="home-events" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary">
                Plan an Event
              </Link>
              <Link href="/events#enquire" className="btn-outline">
                Event Enquiry
              </Link>
            </div>
          </div>
          <Reveal>
            <div className="aspect-[4/3] overflow-hidden">
              <MediaImage src="/images/events.svg" alt="Banquet and event facilities at Vela by Svasti" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Offers */}
      <section className="bg-sand" aria-labelledby="home-offers">
        <div className="shell py-20 lg:py-28">
          <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
            <SectionHeading eyebrow="Offers" title="Value, thoughtfully added" body={offersBody} id="home-offers" />
            <div className="lg:justify-self-end">
              <Link href="/offers" className="btn-outline">
                View All Offers
              </Link>
            </div>
          </div>
          {offers.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {offers.map((offer) => (
                <Link key={offer.id} href={`/offers/${offer.slug}`} className="group border border-line bg-cream">
                  <div className="aspect-[16/10] overflow-hidden">
                    <MediaImage
                      src={offer.imageUrl || "/images/gallery-exterior.svg"}
                      alt={offer.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6">
                    <p className="display text-2xl text-ink">{offer.name}</p>
                    <p className="mt-2 line-clamp-2 text-[0.92rem] text-stone">{offer.description}</p>
                    <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                      View Details →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 border border-line bg-cream p-10 text-center">
              <p className="display text-2xl text-ink">Seasonal offers coming soon</p>
              <p className="mt-3 text-[0.95rem] text-stone">
                Our latest offers will be listed here. Meanwhile, enquire directly and our team will
                share what’s available for your dates.
              </p>
              <div className="mt-6">
                <Link href="/enquire" className="btn-primary">
                  Enquire Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Experiences */}
      <section className="bg-cream border-t border-line" aria-labelledby="home-experience">
        <div className="shell py-20 lg:py-28">
          <SectionHeading
            eyebrow="Experience"
            title="Six ways to spend your time"
            body={experiencesBody}
            align="center"
            id="home-experience"
          />
          <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-y-10 sm:grid-cols-3">
            {experiences.map((item) => (
              <li key={item.title} className="group text-center">
                <Link href={item.href} className="inline-block">
                  <span className="display text-4xl text-ink transition-colors group-hover:text-brass-deep sm:text-5xl">
                    {item.title}
                  </span>
                  <span className="mx-auto mt-3 block h-px w-8 bg-brass/70 transition-all group-hover:w-14" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-14 text-center">
            <Link href="/experience" className="btn-primary">
              Explore Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery band */}
      {gallery.length > 0 && (
        <section className="bg-ink" aria-labelledby="home-gallery">
          <div className="shell py-16">
            <div className="flex items-end justify-between gap-6">
              <SectionHeading eyebrow="Gallery" title="A look around" dark id="home-gallery" />
              <Link href="/gallery" className="btn-light-outline hidden shrink-0 sm:inline-flex">
                View Gallery
              </Link>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto px-5 pb-14 sm:px-8 [scrollbar-width:none]">
            {gallery.map((image) => (
              <Link
                key={image.id}
                href="/gallery"
                className="relative aspect-[4/3] w-72 shrink-0 overflow-hidden"
              >
                <MediaImage src={image.url} alt={image.alt} className="h-full w-full object-cover" />
              </Link>
            ))}
          </div>
          <div className="shell pb-14 sm:hidden">
            <Link href="/gallery" className="btn-light-outline w-full">
              View Gallery
            </Link>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="bg-sand" aria-labelledby="home-location">
        <div className="shell grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden">
              <MediaImage src="/images/location.svg" alt="Vela by Svasti at VIP Chowk, Raipur" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Location"
              title="VIP Chowk, Raipur"
              body="Vela by Svasti is at VIP Chowk, Raipur, Chhattisgarh — easy to reach, easy to stay."
              id="home-location"
            />
            <address className="mt-2 text-[1.05rem] not-italic text-ink">{contact.address}</address>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/location" className="btn-primary">
                Visit Location Page
              </Link>
              <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-line bg-cream" aria-labelledby="home-testimonials">
        <div className="shell py-20 lg:py-28">
          <SectionHeading eyebrow="Guest Notes" title="What guests say" align="center" id="home-testimonials" />
          {testimonials.length > 0 ? (
            <ul className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
              {testimonials.slice(0, 6).map((item, index) => (
                <li key={index} className="flex flex-col justify-between border-t-2 border-brass bg-sand p-8">
                  <p className="display text-xl italic leading-relaxed text-ink">“{item.quote}”</p>
                  <p className="mt-6 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                    — {item.author}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mx-auto mt-10 max-w-xl text-center text-[0.95rem] text-stone">
              Guest testimonials will appear here once approved for publishing. They can be added
              from Admin → Website Content (home.testimonials).
            </p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}