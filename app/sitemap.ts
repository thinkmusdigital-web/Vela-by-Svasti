import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

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

  const [roomTypes, offers] = await Promise.all([
    prisma.roomType.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.offer.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  for (const room of roomTypes) {
    routes.push({
      url: `${SITE_URL}/rooms/${room.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: room.updatedAt,
    });
  }
  for (const offer of offers) {
    routes.push({
      url: `${SITE_URL}/offers/${offer.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
      lastModified: offer.updatedAt,
    });
  }

  return routes;
}