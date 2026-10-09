// Shared domain constants. Stored as plain strings in the database so the
// schema stays portable between SQLite and PostgreSQL.

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOTEL_MANAGER: "HOTEL_MANAGER",
  RESERVATION_STAFF: "RESERVATION_STAFF",
  SALES_STAFF: "SALES_STAFF",
  CONTENT_MANAGER: "CONTENT_MANAGER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  HOTEL_MANAGER: "Hotel Manager",
  RESERVATION_STAFF: "Reservation Staff",
  SALES_STAFF: "Sales Staff",
  CONTENT_MANAGER: "Content Manager",
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  SUPER_ADMIN: "Full access to every module, users and settings.",
  HOTEL_MANAGER: "Rooms, room types and offers.",
  RESERVATION_STAFF: "Dashboard access. Website enquiries arrive in Google Sheets.",
  SALES_STAFF: "Dashboard access. Website enquiries arrive in Google Sheets.",
  CONTENT_MANAGER: "Website content, gallery and offers.",
};

export const ALL_ROLES = Object.values(ROLES);

export const ENQUIRY_TYPES = ["STAY", "EVENT", "GENERAL"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_SOURCES = ["Website", "Walk-in", "Phone", "Referral", "Other"] as const;

export const PREFERRED_CONTACTS = ["PHONE", "WHATSAPP", "EMAIL"] as const;
export type PreferredContact = (typeof PREFERRED_CONTACTS)[number];

export const PREFERRED_CONTACT_LABELS: Record<PreferredContact, string> = {
  PHONE: "Phone call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
};

export const PURPOSES_OF_STAY = ["BUSINESS", "LEISURE", "FAMILY", "EVENT", "OTHER"] as const;

export const PURPOSE_LABELS: Record<string, string> = {
  BUSINESS: "Business",
  LEISURE: "Leisure",
  FAMILY: "Family",
  EVENT: "Event",
  OTHER: "Other",
};

export const EVENT_TYPES = [
  "WEDDING",
  "CORPORATE",
  "CONFERENCE",
  "BIRTHDAY",
  "ANNIVERSARY",
  "SOCIAL_GATHERING",
  "PRIVATE_EVENT",
  "OTHER",
] as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEDDING: "Wedding",
  CORPORATE: "Corporate event",
  CONFERENCE: "Conference",
  BIRTHDAY: "Birthday",
  ANNIVERSARY: "Anniversary",
  SOCIAL_GATHERING: "Social gathering",
  PRIVATE_EVENT: "Private event",
  OTHER: "Other",
};

export const GALLERY_CATEGORIES = [
  "HOTEL",
  "ROOMS",
  "RESTAURANT",
  "CAFE",
  "BAR",
  "SPA",
  "GYM",
  "POOL",
  "EVENTS",
  "EXTERIOR",
  "INTERIOR",
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  HOTEL: "Hotel",
  ROOMS: "Rooms",
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  SPA: "Spa",
  GYM: "Gym",
  POOL: "Pool",
  EVENTS: "Events",
  EXTERIOR: "Exterior",
  INTERIOR: "Interior",
};

export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Stay" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
] as const;

export interface ExperienceMenuGroup {
  id: string;
  label: string;
  href: string;
  items: { label: string; href: string }[];
}

export const EXPERIENCE_MENU: ExperienceMenuGroup[] = [
  {
    id: "dine",
    label: "Dine",
    href: "/dine",
    items: [
      { label: "Fine Dining", href: "/dine" },
      { label: "Café", href: "/dine" },
      { label: "Bar", href: "/dine" },
    ],
  },
  {
    id: "wellness",
    label: "Wellness",
    href: "/wellness",
    items: [
      { label: "Spa", href: "/wellness" },
      { label: "Gym", href: "/wellness" },
    ],
  },
  {
    id: "leisure",
    label: "Leisure",
    href: "/leisure",
    items: [{ label: "Rooftop Swimming Pool", href: "/leisure" }],
  },
  {
    id: "events",
    label: "Events",
    href: "/events",
    items: [
      { label: "Weddings", href: "/events" },
      { label: "Corporate Events", href: "/events" },
      { label: "Celebrations", href: "/events" },
    ],
  },
] as const;

export const EXPERIENCE_PATHS = ["/dine", "/wellness", "/leisure", "/events", "/experience"] as const;
