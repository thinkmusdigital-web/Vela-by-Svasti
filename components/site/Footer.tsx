import Link from "next/link";
import { getContactDetails, getContentValue } from "@/lib/content";
import { EXPERIENCE_MENU } from "@/lib/constants";

export async function Footer() {
  const contact = await getContactDetails();
  const tagline = await getContentValue("brand.tagline", "Stay in the Moment.");
  const footerNote = await getContentValue("footer.note", "Vela by Svasti — Stay in the Moment.");

  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`
    : null;

  return (
    <footer className="border-t border-line bg-sand">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:pr-6">
          <p className="font-display text-2xl font-medium tracking-[0.08em] text-ink">VELA</p>
          <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-brass-deep">
            by Svasti
          </p>
          <p className="display mt-6 text-[1.6rem] text-ink">{tagline}</p>
          <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-stone">
            Contemporary lifestyle hospitality at VIP Chowk, Raipur — stays, dining, wellness and
            celebrations.
          </p>
          {contact.socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {contact.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-brass-deep transition-colors hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Explore">
          <p className="eyebrow mb-5">Explore</p>
          <ul className="grid gap-2.5">
            <li><Link href="/" className="text-[0.92rem] text-stone transition-colors hover:text-ink">Home</Link></li>
            <li><Link href="/rooms" className="text-[0.92rem] text-stone transition-colors hover:text-ink">Stay</Link></li>
            <li><Link href="/about" className="text-[0.92rem] text-stone transition-colors hover:text-ink">About</Link></li>
            <li><Link href="/location" className="text-[0.92rem] text-stone transition-colors hover:text-ink">Location</Link></li>
          </ul>
        </nav>

        <nav aria-label="Experience">
          <p className="eyebrow mb-5">Experience</p>
          <ul className="space-y-2.5">
            {EXPERIENCE_MENU.map((group) => (
              <li key={group.id}>
                <Link href={group.href} className="text-[0.92rem] text-stone transition-colors hover:text-ink">
                  {group.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/experience" className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-brass-deep transition-colors hover:text-ink">
                All Experiences
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5">Visit Vela</p>
          <address className="text-[0.92rem] not-italic leading-relaxed text-stone">
            {contact.address}
          </address>
          <div className="mt-4 flex flex-col gap-2 text-[0.92rem]">
            <Link href="/location" className="link-underline text-ink">
              Location
            </Link>
            <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
              Get Directions
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-5">Contact</p>
          <div className="flex flex-col gap-2 text-[0.92rem]">
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-underline text-ink">
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="link-underline text-ink">
                {contact.email}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
                WhatsApp
              </a>
            )}
            <Link href="/enquire" className="link-underline text-ink">
              Enquire Now
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 text-[0.8rem] text-fog lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {footerNote}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="text-fog transition-colors hover:text-ink">Privacy Policy</Link>
            <Link href="/terms-conditions" className="text-fog transition-colors hover:text-ink">Terms &amp; Conditions</Link>
            <Link href="/cancellation-refund" className="text-fog transition-colors hover:text-ink">Cancellation / Refund Policy</Link>
          </nav>
        </div>
        <div className="border-t border-line">
          <div className="shell py-6 text-[0.8rem] text-fog">
            Website enquiries are handled by our team — rooms and rates are confirmed on call.
          </div>
        </div>
      </div>
    </footer>
  );
}