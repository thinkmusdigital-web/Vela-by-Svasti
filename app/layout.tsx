import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { HotelStructuredData } from "@/components/site/HotelStructuredData";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vela by Svasti — Stay in the Moment | Hotel at VIP Chowk, Raipur",
    template: "%s — Vela by Svasti, Raipur",
  },
  description:
    "Vela by Svasti is a contemporary lifestyle hotel at VIP Chowk, Raipur, Chhattisgarh — 70+ rooms, fine dining, café, bar, spa, gym, rooftop pool and banquet facilities. Enquire for availability.",
  keywords: [
    "Vela by Svasti",
    "hotel in Raipur",
    "VIP Chowk Raipur hotel",
    "luxury hotel Chhattisgarh",
    "rooms in Raipur",
    "banquets near VIP Chowk",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Vela by Svasti",
    title: "Vela by Svasti — Stay in the Moment",
    description:
      "Contemporary lifestyle hotel at VIP Chowk, Raipur — stays, dining, wellness, events and time well spent.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vela by Svasti — Stay in the Moment",
    description:
      "Contemporary lifestyle hotel at VIP Chowk, Raipur — stays, dining, wellness, events and time well spent.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-brass focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <HotelStructuredData />
        {children}
      </body>
    </html>
  );
}