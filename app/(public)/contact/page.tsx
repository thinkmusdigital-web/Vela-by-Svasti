import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getContactDetails, getContentValue } from "@/lib/content";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Vela by Svasti, VIP Chowk, Raipur — phone, email, address and enquiry form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [contact, intro] = await Promise.all([
    getContactDetails(),
    getContentValue(
      "contact.page_intro",
      "Questions about rooms, dining, events or partnerships? Send us a note — our team will get back to you shortly.",
    ),
  ]);

  const roomTypes = await prisma.roomType.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us" intro={intro} />

      <section className="bg-cream" aria-label="Contact information">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1fr_1.5fr] lg:py-24">
          <div>
            <p className="eyebrow">Reach Vela</p>
            <address className="mt-6 not-italic">
              <p className="text-[1.05rem] leading-relaxed text-ink">{contact.address}</p>
              {contact.phone && (
                <p className="mt-5">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="font-display text-3xl text-ink hover:text-brass-deep">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.email && (
                <p className="mt-3">
                  <a href={`mailto:${contact.email}`} className="link-underline text-ink">
                    {contact.email}
                  </a>
                </p>
              )}
            </address>

            {contact.socials.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-5">
                {contact.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-brass-deep hover:text-ink"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-10 border-t border-line pt-6">
              <p className="text-[0.85rem] leading-relaxed text-fog">
                For event enquiries, use the{" "}
                <a href="/events#enquire" className="link-underline text-ink">
                  event enquiry form
                </a>
                .
              </p>
            </div>
          </div>

          <EnquiryForm
            enquiryType="GENERAL"
            roomTypes={roomTypes}
            heading="Send us a message"
            intro="This creates an enquiry — our team replies personally. This is not a booking confirmation."
          />
        </div>
      </section>

      <CtaBand />
    </>
  );
}