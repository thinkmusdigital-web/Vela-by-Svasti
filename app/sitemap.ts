import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/rooms",
  "/dine",
  "/wellness",
  "/leisure",
  "/events",
  "/experience",
  "/about",
  "/gallery",
  "/offers",
  "/location",
  "/enquire",
  "/privacy-policy",
  "/terms-conditions",
  "/cancellation-refund",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  return routes;
}
