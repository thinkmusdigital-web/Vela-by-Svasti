import type { Metadata } from "next";
import Link from "next/link";
import { getContactDetails } from "@/lib/content";

export const metadata: Metadata = {
  title: "Enquiry Received",
  description: "Thank you for contacting Vela by Svasti — our team will contact you shortly.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ enq?: string }>;
}

export default async function EnquirySuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const enquiryId = params.enq?.trim();
  const contact = await getContactDetails();

  return (
    <section className="bg-sand" aria-labelledby="success-title">
      <div className="shell py-20 sm:py-28">
        <div className="mx-auto max-w-2xl border border-line bg-cream p-8 text-center sm:p-14">
          <span
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brass/15 text-3xl text-brass-deep"
          >
            ✓
          </span>
          <h1 id="success-title" className="display mt-8 text-[clamp(2rem,5vw,3rem)] text-ink">
            Thank you for contacting Vela by Svasti.
          </h1>

          {enquiryId ? (
            <>
              <p className="mt-6 text-[1rem] text-stone">Your enquiry reference</p>
              <p className="display mt-2 text-4xl tracking-[0.08em] text-brass-deep">{enquiryId}</p>
            </>
          ) : null}

          <p className="mt-6 text-[1.05rem] leading-relaxed text-ink">
            Our team will contact you shortly.
          </p>

          <p className="mt-4 rounded border border-line bg-sand p-4 text-[0.85rem] leading-relaxed text-fog">
            Please note: this is an enquiry reference — not a booking confirmation. Availability,
            rates and room selection will be confirmed personally by our team.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/rooms" className="btn-primary">
              Explore Rooms
            </Link>
            <Link href="/" className="btn-outline">
              Back to Home
            </Link>
          </div>

          {contact.phone && (
            <p className="mt-8 text-[0.82rem] uppercase tracking-[0.18em] text-fog">
              Need us sooner?{" "}
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-brass-deep">
                {contact.phone}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}