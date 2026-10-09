/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES = [
  { name: "SUPER_ADMIN", description: "Full access to every module, users and settings." },
  { name: "HOTEL_MANAGER", description: "Rooms, room types and offers." },
  { name: "RESERVATION_STAFF", description: "Dashboard access. Website enquiries arrive in Google Sheets." },
  { name: "SALES_STAFF", description: "Dashboard access. Website enquiries arrive in Google Sheets." },
  { name: "CONTENT_MANAGER", description: "Website content, gallery and offers." },
];

interface ContentSeed {
  key: string;
  label: string;
  value: string;
  group: string;
  type?: string;
}

const CONTENT: ContentSeed[] = [
  // Brand
  { key: "brand.name", label: "Brand name", value: "Vela by Svasti", group: "Brand" },
  { key: "brand.tagline", label: "Main tagline", value: "Stay in the Moment.", group: "Brand" },
  { key: "brand.concept", label: "Core concept", value: "Time Well Spent", group: "Brand" },
  {
    key: "brand.signature",
    label: "Brand signature line",
    value: "Stay · Dine · Meet · Unwind · Recharge · Celebrate",
    group: "Brand",
  },

  // Contact (fill these in before launch — no values are invented)
  {
    key: "contact.address",
    label: "Address",
    value: "VIP Chowk, Raipur, Chhattisgarh",
    group: "Contact",
  },
  { key: "contact.phone", label: "Phone number", value: "", group: "Contact" },
  { key: "contact.email", label: "Email address", value: "", group: "Contact" },
  { key: "contact.whatsapp", label: "WhatsApp number", value: "", group: "Contact" },
  {
    key: "contact.mapEmbedUrl",
    label: "Google Maps embed URL",
    value: "",
    group: "Contact",
    type: "text",
  },
  {
    key: "contact.directionsUrl",
    label: "Get directions URL (blank = built from address)",
    value: "",
    group: "Contact",
  },

  // Social
  { key: "social.instagram", label: "Instagram URL", value: "", group: "Social" },
  { key: "social.facebook", label: "Facebook URL", value: "", group: "Social" },
  { key: "social.youtube", label: "YouTube URL", value: "", group: "Social" },
  { key: "social.linkedin", label: "LinkedIn URL", value: "", group: "Social" },

  // Home — hero
  { key: "home.hero_kicker", label: "Hero kicker", value: "VIP Chowk · Raipur", group: "Home page" },
  {
    key: "home.hero_title",
    label: "Hero title (H1)",
    value: "Lifestyle Hotel at VIP Chowk, Raipur",
    group: "Home page",
  },
  {
    key: "home.hero_tagline",
    label: "Hero tagline (subheading)",
    value: "Stay. Dine. Unwind. Celebrate. Your lifestyle hotel in the heart of Raipur.",
    group: "Home page",
  },
  {
    key: "home.hero_subtitle",
    label: "Hero subtitle",
    value:
      "Welcome to a contemporary lifestyle hotel at VIP Chowk, Raipur, where comfortable stays, great dining, rejuvenating wellness, and memorable celebrations come together. Whether you're visiting for business, a weekend break, or a special occasion, every moment here is time well spent.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.hero_image",
    label: "Hero image path",
    value: "/images/hero.svg",
    group: "Home page",
    type: "image",
  },

  // Home — sections
  { key: "home.about_title", label: "About section title", value: "About Vela", group: "Home page" },
  {
    key: "home.about_body",
    label: "About section body",
    value:
      "Vela by Svasti is a contemporary lifestyle hospitality destination at VIP Chowk, Raipur, Chhattisgarh.\n\nWith more than 70 rooms, fine dining, a café, a premium bar, spa, gym, rooftop swimming pool and banquet facilities, Vela brings stays, meals, work, wellness and celebrations together under one roof.\n\nTime well spent — that is the promise behind every stay.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.about_image",
    label: "About section image path",
    value: "/images/about.svg",
    group: "Home page",
    type: "image",
  },
  {
    key: "home.stay_body",
    label: "Stay section body",
    value:
      "More than 70 rooms designed for rest, focus and ease — choose the space that fits your stay and enquire for availability.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.dining_body",
    label: "Dining section body",
    value:
      "A fine dining restaurant, a relaxed café and a premium bar — three ways to gather at the table.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.wellness_body",
    label: "Wellness section body",
    value:
      "Restore at the spa, keep your routine at the gym — wellbeing is part of the stay.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.pool_body",
    label: "Pool section body",
    value:
      "Take the day up to the rooftop swimming pool — open skies above Raipur, unhurried hours below.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.events_body",
    label: "Events section body",
    value:
      "Weddings, corporate events, conferences, birthdays, anniversaries and private gatherings — tell us the occasion and our team will get in touch.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.offers_body",
    label: "Offers section body",
    value: "Seasonal offers and value-added stays, published here as they become available.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.experiences_body",
    label: "Experiences section body",
    value:
      "Stay, Dine, Meet, Unwind, Recharge, Celebrate — six ways to spend your time well at Vela.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.cta_body",
    label: "Final CTA body",
    value:
      "Tell us when you are coming, what you need and who is travelling — our team will call you back shortly.",
    group: "Home page",
    type: "textarea",
  },
  {
    key: "home.testimonials",
    label: "Testimonials (JSON array — max 6)",
    value: "[]",
    group: "Home page",
    type: "json",
  },

  // Rooms
  {
    key: "rooms.page_intro",
    label: "Rooms page intro",
    value:
      "More than 70 rooms across comfortable room types. Choose a room, then enquire for availability — our reservations team will confirm the best fit for your dates.",
    group: "Rooms",
    type: "textarea",
  },

  // Dine
  {
    key: "dine.restaurant_body",
    label: "Fine dining body",
    value:
      "An unhurried fine dining experience at Vela. Menu, seating and operating hours will be published here once confirmed.",
    group: "Dine",
    type: "textarea",
  },
  {
    key: "dine.cafe_body",
    label: "Café body",
    value:
      "A café for slow mornings, working lunches and catch-ups over coffee. Details will be published here once confirmed.",
    group: "Dine",
    type: "textarea",
  },
  {
    key: "dine.bar_body",
    label: "Bar body",
    value:
      "A premium bar to end the day well. Selection and hours will be published here once confirmed.",
    group: "Dine",
    type: "textarea",
  },

  // Wellness
  {
    key: "wellness.spa_body",
    label: "Spa body",
    value:
      "Treatments and therapies to help you slow down. Services and timings will be published here once confirmed.",
    group: "Wellness",
    type: "textarea",
  },
  {
    key: "wellness.gym_body",
    label: "Gym body",
    value:
      "A fully equipped gym for guests who keep their routine on the road. Access details will be published here once confirmed.",
    group: "Wellness",
    type: "textarea",
  },

  // Leisure
  {
    key: "leisure.pool_body",
    label: "Rooftop pool body",
    value:
      "A rooftop swimming pool with open views over Raipur. Timings and policies will be published here once confirmed.",
    group: "Leisure",
    type: "textarea",
  },

  // Events
  {
    key: "events.page_body",
    label: "Events page body",
    value:
      "From weddings and anniversaries to conferences, birthdays and private gatherings — share the occasion, expected guest count and preferred date, and our events team will call you back.",
    group: "Events",
    type: "textarea",
  },

  // Experience
  {
    key: "experience.page_body",
    label: "Experience page body",
    value:
      "Vela is built around six simple ways to spend your time: Stay, Dine, Meet, Unwind, Recharge and Celebrate.",
    group: "Experience",
    type: "textarea",
  },

  // Location
  {
    key: "location.page_body",
    label: "Location page body",
    value:
      "Vela by Svasti is located at VIP Chowk, Raipur, Chhattisgarh. Use Get Directions for turn-by-turn navigation to the property.",
    group: "Location",
    type: "textarea",
  },

  // Contact page
  {
    key: "contact.page_intro",
    label: "Contact page intro",
    value:
      "Questions about rooms, dining, events or partnerships? Send us a note — our team will get back to you shortly.",
    group: "Contact page",
    type: "textarea",
  },

  // Gallery
  {
    key: "gallery.intro",
    label: "Gallery intro",
    value: "A look at the property — add images from Admin → Gallery.",
    group: "Gallery",
    type: "textarea",
  },

  // Footer
  {
    key: "footer.note",
    label: "Footer note",
    value: "Vela by Svasti — Stay in the Moment.",
    group: "Footer",
  },
];

interface RoomTypeSeed {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sizeSqft: number;
  bedType: string;
  maxOccupancy: number;
  image: string;
}

const ROOM_TYPES: RoomTypeSeed[] = [
  {
    name: "Deluxe Room",
    slug: "deluxe-room",
    shortDescription: "A comfortable, well-appointed room for business and leisure stays.",
    description:
      "The Deluxe Room is an easy choice for short stays and city visits — a restful bed, a work-friendly layout and the essentials taken care of. Share your dates to enquire about availability and rates.",
    sizeSqft: 320,
    bedType: "King or twin beds",
    maxOccupancy: 3,
    image: "/images/room-deluxe.svg",
  },
  {
    name: "Premium Room",
    slug: "premium-room",
    shortDescription: "A more spacious room with room to settle in for longer stays.",
    description:
      "The Premium Room offers extra space to work, unwind and stay a little longer. Enquire with your dates and our reservations team will come back with the best available option.",
    sizeSqft: 400,
    bedType: "King bed",
    maxOccupancy: 3,
    image: "/images/room-premium.svg",
  },
  {
    name: "Executive Suite",
    slug: "executive-suite",
    shortDescription: "A suite with a separate living area for work, hosting and unhurried stays.",
    description:
      "The Executive Suite pairs a separate living space with a restful bedroom — suited to longer business stays, hosting and special visits. Request a stay and our team will contact you with details.",
    sizeSqft: 560,
    bedType: "King bed",
    maxOccupancy: 4,
    image: "/images/room-suite.svg",
  },
];

const AMENITIES = [
  "Air conditioning",
  "High-speed Wi-Fi",
  "LED television",
  "Work desk",
  "Tea & coffee maker",
  "In-room safe",
  "Hair dryer",
];

const GALLERY_SEED = [
  { category: "EXTERIOR", url: "/images/gallery-exterior.svg", alt: "Hotel exterior placeholder" },
  { category: "INTERIOR", url: "/images/gallery-interior.svg", alt: "Hotel interior placeholder" },
  { category: "ROOMS", url: "/images/room-deluxe.svg", alt: "Deluxe room placeholder" },
  { category: "RESTAURANT", url: "/images/gallery-restaurant.svg", alt: "Restaurant placeholder" },
  { category: "CAFE", url: "/images/gallery-cafe.svg", alt: "Café placeholder" },
  { category: "BAR", url: "/images/gallery-bar.svg", alt: "Bar placeholder" },
  { category: "SPA", url: "/images/gallery-spa.svg", alt: "Spa placeholder" },
  { category: "GYM", url: "/images/gallery-gym.svg", alt: "Gym placeholder" },
  { category: "POOL", url: "/images/gallery-pool.svg", alt: "Rooftop pool placeholder" },
  { category: "EVENTS", url: "/images/gallery-events.svg", alt: "Banquet hall placeholder" },
];

async function main() {
  console.log("Seeding Vela by Svasti…");

  // Roles
  const roles = new Map<string, string>();
  for (const role of ROLES) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roles.set(role.name, record.id);
  }

  // Users
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe@Vela123";
  const passwordHash = await bcrypt.hash(password, 12);

  const users: { email: string; name: string; role: string }[] = [
    {
      email: process.env.SEED_ADMIN_EMAIL || "admin@velabysvasti.local",
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
    { email: "manager@velabysvasti.local", name: "Hotel Manager", role: "HOTEL_MANAGER" },
    { email: "reservation@velabysvasti.local", name: "Reservation Desk", role: "RESERVATION_STAFF" },
    { email: "sales@velabysvasti.local", name: "Sales Executive", role: "SALES_STAFF" },
    { email: "content@velabysvasti.local", name: "Content Manager", role: "CONTENT_MANAGER" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, roleId: roles.get(user.role)! },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        roleId: roles.get(user.role)!,
      },
    });
  }

  // Website content
  for (const entry of CONTENT) {
    await prisma.websiteContent.upsert({
      where: { key: entry.key },
      update: {},
      create: {
        key: entry.key,
        label: entry.label,
        value: entry.value,
        group: entry.group,
        type: entry.type ?? "text",
      },
    });
  }

  // Room types
  for (const [index, roomType] of ROOM_TYPES.entries()) {
    const created = await prisma.roomType.upsert({
      where: { slug: roomType.slug },
      update: {},
      create: {
        name: roomType.name,
        slug: roomType.slug,
        shortDescription: roomType.shortDescription,
        description: roomType.description,
        sizeSqft: roomType.sizeSqft,
        bedType: roomType.bedType,
        maxOccupancy: roomType.maxOccupancy,
        displayOrder: index,
        seoTitle: `${roomType.name} at Vela by Svasti, VIP Chowk Raipur`,
        seoDescription: roomType.shortDescription,
        images: { create: { url: roomType.image, alt: `${roomType.name} placeholder image`, sortOrder: 0 } },
        amenities: { create: AMENITIES.map((name, i) => ({ name, sortOrder: i })) },
      },
    });

    // A few sample room units so the Rooms module has something to manage.
    if (index === 0) {
      const existing = await prisma.room.count({ where: { roomTypeId: created.id } });
      if (existing === 0) {
        for (const number of ["101", "102", "103", "201", "202", "203"]) {
          await prisma.room.create({
            data: {
              roomNumber: number,
              roomTypeId: created.id,
              floor: number.startsWith("1") ? "1" : "2",
              notes: "Sample record — replace with actual room inventory.",
            },
          });
        }
      }
    }
  }

  // Gallery
  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    for (const [index, image] of GALLERY_SEED.entries()) {
      await prisma.galleryImage.create({
        data: {
          category: image.category,
          url: image.url,
          alt: image.alt,
          sortOrder: index,
          title: `${image.category.charAt(0)}${image.category.slice(1).toLowerCase()} placeholder`,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Admin login: ${process.env.SEED_ADMIN_EMAIL || "admin@velabysvasti.local"} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
