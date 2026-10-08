import { getContactDetails } from "@/lib/content";

export async function HotelStructuredData() {
  const contact = await getContactDetails();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Vela by Svasti",
    description:
      "Contemporary lifestyle hotel at VIP Chowk, Raipur, Chhattisgarh — stays, dining, wellness and events.",
    slogan: "Stay in the Moment.",
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}