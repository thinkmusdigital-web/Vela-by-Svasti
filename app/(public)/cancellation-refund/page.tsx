import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cancellation / Refund Policy",
  description:
    "Cancellation and refund policy for stays planned through Vela by Svasti, VIP Chowk, Raipur.",
  alternates: { canonical: "/cancellation-refund" },
};

const SECTIONS = [
  {
    title: "Confirmation before payment",
    body: "Because this website is enquiry-based, rooms and rates are confirmed personally by our team, and payment is not taken online. The cancellation and refund terms below apply once a stay is confirmed with our team through a separate agreement or booking channel.",
  },
  {
    title: "Enquiry cancellations",
    body: "An enquiry is not a booking. You may withdraw or change an enquiry at any time by letting our team know — there is no charge for enquiries.",
  },
  {
    title: "Confirmed stays",
    body: "For confirmed stays, cancellation terms are shared by our team at the time of confirmation. These generally depend on how close to the check-in date you cancel, and any applicable advance or deposit.",
  },
  {
    title: "Refunds",
    body: "Where a refund is due, it is processed through the same channel used for payment. Refund timelines depend on the bank or payment partner and are shared at the time of processing.",
  },
  {
    title: "Contact",
    body: "For questions about a specific cancellation or refund, please contact our team through the enquiry form on this website.",
  },
];

export default function CancellationRefundPage() {
  return (
    <>
      <header className="bg-sand">
        <div className="shell py-14 sm:py-20">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,4rem)] text-ink">
            Cancellation / Refund Policy
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-stone">
            Last updated: October 2026
          </p>
        </div>
      </header>

      <section className="bg-cream" aria-label="Cancellation and refund policy">
        <div className="shell py-14 lg:py-20">
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