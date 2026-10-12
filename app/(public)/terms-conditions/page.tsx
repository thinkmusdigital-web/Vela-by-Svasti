import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using the Vela by Svasti website and enquiry-based stay planning.",
  alternates: { canonical: "/terms-conditions" },
};

const SECTIONS = [
  {
    title: "Enquiry-based booking",
    body: "This website is enquiry-based. Submitting an enquiry does not create or confirm a booking. Availability, room selection and rates are confirmed personally by our team over the phone before any stay is finalised.",
  },
  {
    title: "Rates and availability",
    body: "Rates and availability shown or quoted are indicative and may change. The confirmed rate is the one agreed with our team before your stay is finalised.",
  },
  {
    title: "Guest responsibilities",
    body: "Information shared in enquiries should be accurate and current. The person submitting the enquiry confirms they are able to represent the group travelling.",
  },
  {
    title: "Website use",
    body: "You may use this website for lawful, personal, enquiry-related purposes. You may not attempt to disrupt the website, access the admin area, or misuse the enquiry form.",
  },
  {
    title: "Intellectual property",
    body: "The Vela by Svasti name, branding, images and content on this website belong to Vela by Svasti and may not be reproduced without permission.",
  },
  {
    title: "Changes",
    body: "These terms may be updated from time to time. Continued use of the website after changes means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <header className="bg-sand">
        <div className="shell pt-16 pb-14 sm:py-20">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-stone">
            Last updated: October 2026
          </p>
        </div>
      </header>

      <section className="bg-cream" aria-label="Terms and conditions">
        <div className="shell py-14 lg:py-20">
          <div className="mt-10 max-w-2xl space-y-8 border-t border-line pt-10">
            {SECTIONS.map((section, index) => (
              <div key={section.title}>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-display text-xl text-ink">{section.title}</h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-stone">{section.body}</p>
              </div>
            ))}
          </div>
          <Link href="/" className="btn-outline mt-12 inline-flex">
            Back to Home
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}