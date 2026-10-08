interface RoomTypeImageInput {
  url: string;
  alt?: string;
}

export interface RoomTypeInput {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  sizeSqft?: number | null;
  bedType?: string;
  maxOccupancy?: number;
  displayOrder?: number;
  active?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  amenities?: string[];
  images?: RoomTypeImageInput[];
}

function cleanString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, max);
}

function cleanNullableString(value: unknown, max: number): string | null | undefined {
  if (value === null || value === "") return null;
  const cleaned = cleanString(value, max);
  return cleaned === undefined ? undefined : cleaned;
}

/** Loose, route-level validation for room type create/update payloads. */
export function parseRoomTypeInput(body: unknown): { data: RoomTypeInput; error?: string } {
  if (!body || typeof body !== "object") return { data: {}, error: "Invalid body." };

  const source = body as Record<string, unknown>;
  const data: RoomTypeInput = {};

  if ("name" in source) {
    const name = cleanString(source.name, 160);
    if (!name) return { data, error: "Name is required." };
    data.name = name;
  }
  if ("slug" in source) {
    const slug = cleanString(source.slug, 160);
    data.slug = slug || undefined;
  }
  if ("shortDescription" in source) data.shortDescription = cleanString(source.shortDescription, 400) ?? "";
  if ("description" in source) data.description = cleanString(source.description, 12000) ?? "";
  if ("bedType" in source) data.bedType = cleanString(source.bedType, 120) ?? "";
  if ("seoTitle" in source) data.seoTitle = cleanNullableString(source.seoTitle, 200);
  if ("seoDescription" in source) data.seoDescription = cleanNullableString(source.seoDescription, 400);

  if ("sizeSqft" in source) {
    const value = source.sizeSqft === null || source.sizeSqft === "" ? null : Number(source.sizeSqft);
    if (value !== null && (Number.isNaN(value) || value < 0 || value > 100000)) {
      return { data, error: "Size must be a valid number of square feet." };
    }
    data.sizeSqft = value;
  }
  if ("maxOccupancy" in source) {
    const value = Number(source.maxOccupancy);
    if (Number.isNaN(value) || value < 1 || value > 50) {
      return { data, error: "Max occupancy must be between 1 and 50." };
    }
    data.maxOccupancy = Math.round(value);
  }
  if ("displayOrder" in source) {
    const value = Number(source.displayOrder);
    if (Number.isNaN(value) || value < 0 || value > 1000) {
      return { data, error: "Display order is invalid." };
    }
    data.displayOrder = Math.round(value);
  }
  if ("active" in source) {
    if (typeof source.active !== "boolean") return { data, error: "active must be true or false." };
    data.active = source.active;
  }

  if ("amenities" in source) {
    if (!Array.isArray(source.amenities)) return { data, error: "amenities must be an array." };
    const amenities = source.amenities
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().slice(0, 120))
      .filter(Boolean);
    data.amenities = [...new Set(amenities)];
  }

  if ("images" in source) {
    if (!Array.isArray(source.images)) return { data, error: "images must be an array." };
    const images: RoomTypeImageInput[] = [];
    for (const item of source.images.slice(0, 30)) {
      if (!item || typeof item !== "object") continue;
      const { url, alt } = item as { url?: unknown; alt?: unknown };
      if (typeof url !== "string" || !/^\/(images|uploads)\//.test(url)) continue;
      images.push({ url, alt: typeof alt === "string" ? alt.trim().slice(0, 200) : "" });
    }
    data.images = images;
  }

  return { data };
}