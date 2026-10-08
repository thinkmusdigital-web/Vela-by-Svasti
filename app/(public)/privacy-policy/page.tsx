import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Vela by Svasti collects, uses and protects the personal information shared through this website.",
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS = [
  {
    title: "Information we collect",
    body: "When you submit an enquiry through this website, we collect the details you share: your name, mobile number, email address, travel dates, room preference, number of rooms, guests, purpose of stay and any special requests. We also collect basic technical data (such as the pages you visit) to keep the website secure and understand how it is used.",
  },
  {
    title: "How we use your information",
    body: "Your enquiry details are used to respond to your request — a member of our team will contact you to confirm availability, rates and details. Details are shared only with the Vela by Svasti staff who handle enquiries, follow-ups and quotations.",
  },
  {
    title: "What we do not do",
    body: "This website does not process online payments and we do not sell or rent your information to third parties for marketing. Your details are not used to send promotional messages unless you separately opt in.",
  },
  {
    title: "Data retention",
    body: "Enquiries are retained for as long as needed to serve you and for our internal records. You may request that we remove your enquiry details at any time by contacting us.",
  },
  {
    title: "Security",
    body: "Enquiry submissions are protected against spam and misuse, and access to the enquiry records is restricted to authorised hotel staff through a secure, password-protected admin area.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions, please contact us through the enquiry form on this website.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <header className="bg-sand">
        <div className="shell py-14 sm:py-20">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-stone">
            Last updated: October 2026
          </p>
        </div>
      </header>

      <section className="bg-cream" aria-label="Privacy policy">
        <div className="shell py-14 lg:py-20">
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-stone">
            Vela by Svasti respects your privacy. This policy explains what we collect through this
            website and how we use it.
          </p>
          <div className="mt-10 max-w-2xl space-y-8 border-t border-line pt-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-xl text-ink">{section.title}</h2>
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