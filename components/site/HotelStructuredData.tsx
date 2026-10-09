import { getContactDetails } from "@/lib/content";
import { jsonLdString } from "@/lib/sanitize";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function HotelStructuredData() {
  const contact = await getContactDetails();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Vela by Svasti",
    description:
      "Stay at a contemporary lifestyle hotel in VIP Chowk, Raipur. Enjoy comfortable rooms, fine dining, wellness, and celebration venues, all under one roof.",
    url: SITE_URL,
    // TODO: Replace with a real property photograph (absolute URL) once available.
    image: `${SITE_URL}/images/hotel-exterior.jpg`,
    slogan: "Stay. Dine. Unwind. Celebrate. Your lifestyle hotel in the heart of Raipur.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "VIP Chowk",
      addressLocality: "Raipur",
      addressRegion: "Chhattisgarh",
      addressCountry: "IN",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Restaurant" },
      { "@type": "LocationFeatureSpecification", name: "Café" },
      { "@type": "LocationFeatureSpecification", name: "Bar" },
      { "@type": "LocationFeatureSpecification", name: "Spa" },
      { "@type": "LocationFeatureSpecification", name: "Fitness centre" },
      { "@type": "LocationFeatureSpecification", name: "Rooftop swimming pool" },
      { "@type": "LocationFeatureSpecification", name: "Banquet and event facilities" },
    ],
    // TODO: contact.phone and contact.email are empty ("coming soon") until the
    // hotel provides them — leave blank rather than invent values.
    ...(contact.phone && {
      telephone: contact.phone,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: contact.phone,
        contactType: "reservations",
        availableLanguage: ["en", "hi"],
      },
    }),
    ...(contact.email && { email: contact.email }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
  );
}
