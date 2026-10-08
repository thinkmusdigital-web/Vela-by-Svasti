import { z } from "zod";
import {
  ENQUIRY_TYPES,
  EVENT_TYPES,
  PREFERRED_CONTACTS,
  PURPOSES_OF_STAY,
} from "@/lib/constants";
import { normalizeMobile, paragraph, singleLine } from "@/lib/sanitize";

const MAX_TEXT = 500;
const MAX_REQUEST = 4000;

// Accepts "YYYY-MM-DD" as well as full ISO datetimes (the browser form
// sends Date objects via JSON.stringify, which serializes to the latter).
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/;

function isValidCalendarDate(datePart: string): boolean {
  const [year, month, day] = datePart.split("-").map(Number);
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

function parseDate(value: string): Date | undefined {
  if (!dateOnlyRegex.test(value) && !dateRegex.test(value)) return undefined;
  if (!isValidCalendarDate(value.slice(0, 10))) return undefined; // rejects 2026-02-30
  const normalized = dateOnlyRegex.test(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

const dateField = z
  .string()
  .regex(dateRegex, "Use a valid date")
  .optional()
  .transform((value) => (value ? parseDate(value) : undefined));

const mobileField = z
  .string()
  .min(1, "Mobile number is required")
  .transform((value) => normalizeMobile(value))
  .refine((value) => /^[6-9]\d{9}$/.test(value), {
    message: "Enter a valid 10-digit mobile number",
  });

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

const intField = (min: number, max: number, fallback: number) =>
  z.coerce.number().int().min(min).max(max).default(fallback);

export const enquiryInputSchema = z
  .object({
    enquiryType: z.enum(ENQUIRY_TYPES).default("STAY"),
    customerName: z
      .string()
      .transform(singleLine)
      .pipe(z.string().min(2, "Please enter your name").max(120)),
    mobileNumber: mobileField,
    email: emailField,
    checkInDate: dateField,
    checkOutDate: dateField,
    adults: intField(1, 50, 1),
    children: intField(0, 30, 0),
    roomTypeId: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .optional()
      .transform((v) => (v ? v : undefined)),
    numberOfRooms: intField(1, 20, 1),
    purposeOfStay: z.enum(PURPOSES_OF_STAY).optional(),
    specialRequest: z
      .string()
      .max(MAX_REQUEST)
      .optional()
      .transform((v) => (v ? paragraph(v).slice(0, MAX_REQUEST) : undefined)),
    preferredContact: z.enum(PREFERRED_CONTACTS).default("PHONE"),
    companyName: z
      .string()
      .max(MAX_TEXT)
      .optional()
      .transform((v) => (v ? singleLine(v).slice(0, MAX_TEXT) || undefined : undefined)),
    eventType: z.enum(EVENT_TYPES).optional(),
    expectedGuests: z.coerce.number().int().min(1).max(5000).optional(),
    approximateBudget: z
      .string()
      .max(MAX_TEXT)
      .optional()
      .transform((v) => (v ? singleLine(v).slice(0, MAX_TEXT) || undefined : undefined)),
    preferredCallTime: z
      .string()
      .max(MAX_TEXT)
      .optional()
      .transform((v) => (v ? singleLine(v).slice(0, MAX_TEXT) || undefined : undefined)),
    /** Honeypot — must be left empty by real visitors. */
    website: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enquiryType === "STAY") {
      if (!data.checkInDate) {
        ctx.addIssue({ code: "custom", path: ["checkInDate"], message: "Check-in date is required" });
      }
      if (!data.checkOutDate) {
        ctx.addIssue({ code: "custom", path: ["checkOutDate"], message: "Check-out date is required" });
      }
    }
    if (data.enquiryType === "EVENT") {
      if (!data.checkInDate) {
        ctx.addIssue({ code: "custom", path: ["checkInDate"], message: "Preferred date is required" });
      }
      if (!data.eventType) {
        ctx.addIssue({ code: "custom", path: ["eventType"], message: "Event type is required" });
      }
    }
    if (
      data.checkInDate instanceof Date &&
      data.checkOutDate instanceof Date &&
      data.checkOutDate.getTime() <= data.checkInDate.getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["checkOutDate"],
        message: "Check-out must be after check-in",
      });
    }
  });

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required").max(200),
});
