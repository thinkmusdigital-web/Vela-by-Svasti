export interface OfferInput {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
  roomTypeId?: string | null;
  terms?: string;
  active?: boolean;
  sortOrder?: number;
}

function parseDay(value: unknown): Date | null | undefined {
  if (value === null || value === "" || value === undefined) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  return date;
}

export function parseOfferInput(body: unknown): { data: OfferInput; error?: string } {
  if (!body || typeof body !== "object") return { data: {}, error: "Invalid body." };
  const source = body as Record<string, unknown>;
  const data: OfferInput = {};

  if ("name" in source) {
    if (typeof source.name !== "string" || !source.name.trim()) return { data, error: "Name is required." };
    data.name = source.name.trim().slice(0, 160);
  }
  if ("slug" in source) {
    data.slug = typeof source.slug === "string" ? source.slug.trim().slice(0, 160) : undefined;
  }
  if ("description" in source) {
    data.description = typeof source.description === "string" ? source.description.slice(0, 6000) : "";
  }
  if ("terms" in source) {
    data.terms = typeof source.terms === "string" ? source.terms.slice(0, 6000) : "";
  }
  if ("imageUrl" in source) {
    const value = source.imageUrl;
    if (value !== null && (typeof value !== "string" || !/^\/(images|uploads)\//.test(value))) {
      return { data, error: "A valid image URL is required." };
    }
    data.imageUrl = value === null ? null : value;
  }
  if ("roomTypeId" in source) {
    const value = source.roomTypeId;
    if (value !== null && typeof value !== "string") return { data, error: "Invalid room type." };
    data.roomTypeId = value === null ? null : value;
  }
  if ("validFrom" in source) {
    const value = parseDay(source.validFrom);
    if (value === undefined) return { data, error: "Valid-from date is invalid." };
    data.validFrom = value;
  }
  if ("validUntil" in source) {
    const value = parseDay(source.validUntil);
    if (value === undefined) return { data, error: "Valid-until date is invalid." };
    data.validUntil = value;
  }
  if ("active" in source) {
    if (typeof source.active !== "boolean") return { data, error: "active must be true or false." };
    data.active = source.active;
  }
  if ("sortOrder" in source) {
    const value = Number(source.sortOrder);
    if (Number.isNaN(value) || value < 0) return { data, error: "Sort order is invalid." };
    data.sortOrder = Math.round(value);
  }

  return { data };
}