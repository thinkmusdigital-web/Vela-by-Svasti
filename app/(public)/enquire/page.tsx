import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getContactDetails } from "@/lib/content";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Enquire Now",
  description:
    "Send an enquiry to Vela by Svasti, VIP Chowk, Raipur. Rooms, dining, wellness and events — our team will call you back to confirm availability and rates.",
  alternates: { canonical: "/enquire" },
};

interface PageProps {
  searchParams: Promise<{ type?: string; room?: string; event?: string }>;
}

export default async function EnquirePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawType = params.type ?? "stay";
  const enquiryType = rawType === "event" ? "EVENT" : rawType === "general" ? "GENERAL" : "STAY";
  const roomSlug = params.room;
  const eventType = params.event;

  const contact = await getContactDetails();
  const roomTypes = await prisma.roomType.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const defaultRoom = roomSlug ? roomTypes.find((room) => room.slug === roomSlug) : undefined;

  const isEvent = enquiryType === "EVENT";
  const isGeneral = enquiryType === "GENERAL";

  const eyebrow = isEvent ? "Plan an Event" : isGeneral ? "Get in Touch" : "Request a Stay";
  const title = isEvent ? "Tell us about your occasion" : isGeneral ? "We’d love to hear from you" : "Plan your stay";
  const intro = isEvent
    ? "Tell us the occasion, the date and the expected guest count — our events team will call you back with options."
    : isGeneral
      ? "Questions about rooms, dining, events or partnerships? Send us a note."
      : "Share your dates and preferences. Our reservations team will call you to confirm availability and rates — this is an enquiry, not a booking.";

  const steps = [
    { title: "1 · Enquiry", body: "You share your dates and preferences." },
    { title: "2 · Our call", body: "A team member contacts you personally." },
    { title: "3 · Confirmation", body: "Rates and availability are confirmed over the call." },
  ];

  return (
    <>
      <header className="bg-sand">
        <div className="shell py-14 sm:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">{title}</h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-stone">{intro}</p>
        </div>
      </header>

      <section className="bg-cream" aria-label="Enquiry form">
        <div className="shell grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr] lg:py-20">
          <EnquiryForm
            enquiryType={enquiryType}
            defaultRoomId={defaultRoom?.id}
            defaultEventType={eventType?.toUpperCase()}
            roomTypes={roomTypes}
            heading={isEvent ? "Event Enquiry" : isGeneral ? "Contact Form" : "Request a Stay"}
          />

          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="eyebrow mb-5">What happens next</p>
              <ol className="space-y-5 border-t border-line pt-6">
                {steps.map((step) => (
                  <li key={step.title}>
                    <p className="font-display text-xl text-ink">{step.title}</p>
                    <p className="mt-1 text-[0.92rem] leading-relaxed text-stone">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="eyebrow mb-5">Prefer to talk?</p>
              <address className="not-italic">
                <p className="text-[0.95rem] leading-relaxed text-stone">{contact.address}</p>
                {contact.phone && (
                  <p className="mt-3">
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="font-display text-2xl text-ink hover:text-brass-deep">
                      {contact.phone}
                    </a>
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-2 text-[0.95rem]">
                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-ink"
                    >
                      WhatsApp us
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="link-underline text-ink">
                      {contact.email}
                    </a>
                  )}
                </div>
              </address>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="#enquiry-form" className="btn-brass">
                  Submit Enquiry
                </a>
                <Link href="/location" className="btn-outline">
                  Visit Us
                </Link>
              </div>
              <p className="mt-6 text-[0.82rem] leading-relaxed text-fog">
                The enquiry form is protected against spam. Submissions are reviewed by our team and
                answered personally.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}