import "server-only";
import { cache } from "react";
import { isHttpUrl, safeEmbedUrl } from "@/lib/url";

export const getContentMap = cache(async (): Promise<Record<string, string>> => {
  // Public site is database-free for the initial deployment. Values supplied
  // by each page are the source-controlled defaults; Prisma-backed editing is
  // intentionally deferred until a persistent database is provisioned.
  return {};
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

  // Admin-editable URLs are allow-listed at render time: non-http(s) values
  // (e.g. javascript:) are dropped so they can never become active code.
  const configuredDirections = map["contact.directionsUrl"] || "";
  const directionsUrl = isHttpUrl(configuredDirections)
    ? configuredDirections
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const mapEmbedUrl = safeEmbedUrl(map["contact.mapEmbedUrl"] || "");

  const socials = [
    { label: "Instagram", url: map["social.instagram"] || "" },
    { label: "Facebook", url: map["social.facebook"] || "" },
    { label: "YouTube", url: map["social.youtube"] || "" },
    { label: "LinkedIn", url: map["social.linkedin"] || "" },
  ].filter((s) => isHttpUrl(s.url));

  return {
    address,
    phone: map["contact.phone"] || "",
    email: map["contact.email"] || "",
    whatsapp: map["contact.whatsapp"] || "",
    mapEmbedUrl,
    directionsUrl,
    socials,
  };
});

export const getSettingsMap = cache(async (): Promise<Record<string, string>> => {
  return {};
});
