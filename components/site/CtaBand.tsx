import Link from "next/link";
import { getContactDetails, getContentValue } from "@/lib/content";

export async function CtaBand() {
  const contact = await getContactDetails();
  const body = await getContentValue(
    "home.cta_body",
    "Tell us when you are coming and who is travelling — our team will call you back shortly.",
  );

  return (
    <section className="bg-ink text-cream" aria-labelledby="cta-heading">
      <div className="shell py-20 text-center sm:py-28">
        <p className="eyebrow mb-5 text-brass">Plan Your Stay</p>
        <h2
          id="cta-heading"
          className="display mx-auto max-w-3xl text-[clamp(2.2rem,5vw,3.6rem)] text-cream"
        >
          Ready for time well spent?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-cream/75">{body}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/enquire" className="btn-brass w-full sm:w-auto">
            Enquire Now
          </Link>
          <Link href="/rooms" className="btn-light-outline w-full sm:w-auto">
            Explore Rooms
          </Link>
        </div>
        {contact.phone && (
          <p className="mt-8 text-[0.85rem] uppercase tracking-[0.2em] text-cream/60">
            Or call us directly —{" "}
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-brass">
              {contact.phone}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}