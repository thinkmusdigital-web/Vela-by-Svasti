import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const getContentMap = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.websiteContent.findMany({ select: { key: true, value: true } });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
});

export async function getContentValue(key: string, fallback = ""): Promise<string> {
  const map = await getContentMap();
  const value = map[key];
  return value === undefined || value === "" ? fallback : value;
}

export async function getContentJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getContentValue(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface ContactDetails {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  socials: { label: string; url: string }[];
}

export const getContactDetails = cache(async (): Promise<ContactDetails> => {
  const map = await getContentMap();
  const address = map["contact.address"] || "VIP Chowk, Raipur, Chhattisgarh";
  const directionsUrl =
    map["contact.directionsUrl"] ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const socials = [
    { label: "Instagram", url: map["social.instagram"] || "" },
    { label: "Facebook", url: map["social.facebook"] || "" },
    { label: "YouTube", url: map["social.youtube"] || "" },
    { label: "LinkedIn", url: map["social.linkedin"] || "" },
  ].filter((s) => s.url);

  return {
    address,
    phone: map["contact.phone"] || "",
    email: map["contact.email"] || "",
    whatsapp: map["contact.whatsapp"] || "",
    mapEmbedUrl: map["contact.mapEmbedUrl"] || "",
    directionsUrl,
    socials,
  };
});

export const getSettingsMap = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.setting.findMany({ select: { key: true, value: true } });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
});
