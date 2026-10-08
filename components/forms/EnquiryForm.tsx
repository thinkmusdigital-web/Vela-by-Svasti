"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { enquiryInputSchema, type EnquiryInput } from "@/lib/validate";
import { EVENT_TYPE_LABELS, EVENT_TYPES, PREFERRED_CONTACTS, PURPOSES_OF_STAY, PURPOSE_LABELS } from "@/lib/constants";

export interface RoomOption {
  id: string;
  name: string;
  slug: string;
}

interface EnquiryFormProps {
  enquiryType?: "STAY" | "EVENT" | "GENERAL";
  defaultRoomId?: string;
  defaultEventType?: string;
  roomTypes: RoomOption[];
  heading?: string;
  intro?: string;
}

const FIELDS = {
  customerName: "Your full name",
  mobileNumber: "Mobile number",
  email: "Email address",
  checkInDate: "Check-in date",
  checkOutDate: "Check-out date",
  adults: "Adults",
  children: "Children",
  roomTypeId: "Preferred room type",
  numberOfRooms: "Number of rooms",
  purposeOfStay: "Purpose of stay",
  specialRequest: "Special request",
  preferredContact: "Preferred contact method",
  companyName: "Company name",
  eventType: "Event type",
  expectedGuests: "Expected guests",
  approximateBudget: "Approximate budget",
  preferredCallTime: "Preferred call time",
  form: "Submission",
} as const;

export function EnquiryForm({
  enquiryType = "STAY",
  defaultRoomId,
  defaultEventType,
  roomTypes,
  heading,
  intro,
}: EnquiryFormProps) {
  const router = useRouter();
  const formId = useId();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [website, setWebsite] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const raw = {
      enquiryType,
      customerName: String(form.get("customerName") ?? ""),
      mobileNumber: String(form.get("mobileNumber") ?? ""),
      email: String(form.get("email") ?? ""),
      checkInDate: String(form.get("checkInDate") ?? "") || undefined,
      checkOutDate: String(form.get("checkOutDate") ?? "") || undefined,
      adults: String(form.get("adults") ?? "1"),
      children: String(form.get("children") ?? "0"),
      roomTypeId: String(form.get("roomTypeId") ?? "") || undefined,
      numberOfRooms: String(form.get("numberOfRooms") ?? "1"),
      purposeOfStay: String(form.get("purposeOfStay") ?? "") || undefined,
      specialRequest: String(form.get("specialRequest") ?? "") || undefined,
      preferredContact: String(form.get("preferredContact") ?? "PHONE"),
      companyName: String(form.get("companyName") ?? "") || undefined,
      eventType: String(form.get("eventType") ?? "") || undefined,
      expectedGuests: String(form.get("expectedGuests") ?? "") || undefined,
      approximateBudget: String(form.get("approximateBudget") ?? "") || undefined,
      preferredCallTime: String(form.get("preferredCallTime") ?? "") || undefined,
      website,
    };

    const parsed = enquiryInputSchema.safeParse(raw);

    if (!parsed.success) {
      setSubmitting(false);
      setFieldErrors(
        Object.fromEntries(
          Object.entries(parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
            const key = String(issue.path[0] ?? "form");
            (acc[key] ??= []).push(issue.message);
            return acc;
          }, {})).map(([key, messages]) => [key, messages[0]]),
        ),
      );
      setGeneralError("Please correct the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    const payload = parsed.data as EnquiryInput & { website: string };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "vela-admin-panel",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          fieldErrors?: Record<string, string>;
        } | null;
        if (body?.fieldErrors) {
          setFieldErrors(body.fieldErrors);
          setGeneralError("Please correct the highlighted fields and try again.");
        } else {
          setGeneralError(
            body?.error ||
              "Something went wrong while submitting your enquiry. Please try again or contact us directly.",
          );
        }
        return;
      }

      const result = (await response.json()) as { enquiryId?: string };
      const params = new URLSearchParams();
      if (result.enquiryId) params.set("enq", result.enquiryId);
      router.push(`/enquire/success${params.toString() ? `?${params.toString()}` : ""}`);
    } catch {
      setGeneralError(
        "Something went wrong while submitting your enquiry. Please try again or contact us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isEvent = enquiryType === "EVENT";
  const isGeneral = enquiryType === "GENERAL";

  return (
    <form
      id="enquiry-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={formId}
      className="border border-line bg-white p-6 sm:p-8"
    >
      <h2 id={formId} className="display text-3xl text-ink">
        {heading ?? (isEvent ? "Event Enquiry" : isGeneral ? "Send us a message" : "Request a Stay")}
      </h2>
      {intro && <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">{intro}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label={FIELDS.customerName} error={fieldErrors.customerName} className="sm:col-span-1" required>
          <input
            id="customerName"
            name="customerName"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(fieldErrors.customerName)}
            className="input-field"
            placeholder="e.g. Rahul Sharma"
          />
        </Field>
        <Field label={FIELDS.mobileNumber} error={fieldErrors.mobileNumber} required>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(fieldErrors.mobileNumber)}
            className="input-field"
            placeholder="10-digit mobile number"
          />
        </Field>
        <Field label={FIELDS.email} error={fieldErrors.email} className="sm:col-span-2" required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            className="input-field"
            placeholder="you@example.com"
          />
        </Field>

        {isGeneral ? (
          <Field
            label="Your message"
            error={fieldErrors.specialRequest}
            className="sm:col-span-2"
            required
          >
            <textarea
              id="specialRequest"
              name="specialRequest"
              rows={5}
              required
              aria-invalid={Boolean(fieldErrors.specialRequest)}
              className="input-field resize-y"
              placeholder="How can we help?"
            />
          </Field>
        ) : (
          <>
            <Field label={isEvent ? "Preferred date" : FIELDS.checkInDate} error={fieldErrors.checkInDate} required>
              <input
                id="checkInDate"
                name="checkInDate"
                type="date"
                required
                aria-invalid={Boolean(fieldErrors.checkInDate)}
                className="input-field"
              />
            </Field>
            <Field label={isEvent ? "End date (optional)" : FIELDS.checkOutDate} error={fieldErrors.checkOutDate} required={!isEvent}>
              <input
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                required={!isEvent}
                aria-invalid={Boolean(fieldErrors.checkOutDate)}
                className="input-field"
              />
            </Field>

            {isEvent ? (
              <>
                <Field label={FIELDS.eventType} error={fieldErrors.eventType} required>
                  <select
                    id="eventType"
                    name="eventType"
                    defaultValue={defaultEventType ?? ""}
                    required
                    aria-invalid={Boolean(fieldErrors.eventType)}
                    className="input-field"
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {EVENT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={FIELDS.expectedGuests} error={fieldErrors.expectedGuests}>
                  <input
                    id="expectedGuests"
                    name="expectedGuests"
                    type="number"
                    min={1}
                    max={5000}
                    inputMode="numeric"
                    aria-invalid={Boolean(fieldErrors.expectedGuests)}
                    className="input-field"
                    placeholder="e.g. 150"
                  />
                </Field>
                <Field
                  label="Your message"
                  error={fieldErrors.specialRequest}
                  className="sm:col-span-2"
                >
                  <textarea
                    id="specialRequest"
                    name="specialRequest"
                    rows={4}
                    aria-invalid={Boolean(fieldErrors.specialRequest)}
                    className="input-field resize-y"
                    placeholder="Tell us about your event — date, guest count, setup ideas"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label={FIELDS.adults} error={fieldErrors.adults}>
                  <input
                    id="adults"
                    name="adults"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={1}
                    inputMode="numeric"
                    className="input-field"
                  />
                </Field>
                <Field label={FIELDS.children} error={fieldErrors.children}>
                  <input
                    id="children"
                    name="children"
                    type="number"
                    min={0}
                    max={30}
                    defaultValue={0}
                    inputMode="numeric"
                    className="input-field"
                  />
                </Field>
                <Field label={FIELDS.roomTypeId} error={fieldErrors.roomTypeId}>
                  <select
                    id="roomTypeId"
                    name="roomTypeId"
                    defaultValue={defaultRoomId ?? ""}
                    className="input-field"
                  >
                    <option value="">Not sure yet</option>
                    {roomTypes.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={FIELDS.numberOfRooms} error={fieldErrors.numberOfRooms}>
                  <input
                    id="numberOfRooms"
                    name="numberOfRooms"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={1}
                    inputMode="numeric"
                    className="input-field"
                  />
                </Field>
                <Field label={FIELDS.purposeOfStay} error={fieldErrors.purposeOfStay} className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {PURPOSES_OF_STAY.map((purpose) => (
                      <label key={purpose} className="flex items-center gap-2 border border-line bg-sand px-4 py-2.5 text-[0.9rem] text-ink has-[:checked]:border-brass-deep has-[:checked]:bg-brass/10">
                        <input type="radio" name="purposeOfStay" value={purpose} className="sr-only" />
                        {PURPOSE_LABELS[purpose]}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}
          </>
        )}

        <Field
          label={FIELDS.specialRequest}
          error={fieldErrors.specialRequest}
          className={`${isEvent || isGeneral ? "hidden" : "sm:col-span-2"}`}
        >
          <textarea
            id="specialRequestStay"
            name="specialRequest"
            rows={3}
            aria-invalid={Boolean(fieldErrors.specialRequest)}
            className="input-field resize-y"
            placeholder="Anything we should know — arrival time, occasion, preferences"
          />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="label-field">{FIELDS.preferredContact}</legend>
          <div className="flex flex-wrap gap-5">
            {PREFERRED_CONTACTS.map((contact) => (
              <label key={contact} className="flex items-center gap-2 text-[0.95rem] text-ink">
                <input
                  type="radio"
                  name="preferredContact"
                  value={contact}
                  defaultChecked={contact === "PHONE"}
                  className="h-4 w-4 accent-brass-deep"
                />
                {contact === "PHONE" ? "Phone call" : contact === "WHATSAPP" ? "WhatsApp" : "Email"}
              </label>
            ))}
          </div>
        </fieldset>

        {(!isEvent && !isGeneral) && (
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setShowOptional((value) => !value)}
              aria-expanded={showOptional}
              className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-brass-deep hover:text-ink"
            >
              {showOptional ? "− Hide optional details" : "+ Add optional details"}
            </button>
            {showOptional && (
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <Field label={FIELDS.companyName} error={fieldErrors.companyName}>
                  <input id="companyName" name="companyName" type="text" autoComplete="organization" className="input-field" />
                </Field>
                <Field label={FIELDS.approximateBudget} error={fieldErrors.approximateBudget}>
                  <input id="approximateBudget" name="approximateBudget" type="text" className="input-field" placeholder="e.g. ₹8,000–₹12,000 / night" />
                </Field>
                <Field label={FIELDS.preferredCallTime} error={fieldErrors.preferredCallTime}>
                  <input id="preferredCallTime" name="preferredCallTime" type="text" className="input-field" placeholder="e.g. 10am–12pm" />
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Honeypot — hidden from visitors and assistive tech */}
      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {generalError && (
        <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-[0.92rem] text-red-800">
          {generalError}
        </p>
      )}

      <p className="mt-6 text-[0.82rem] leading-relaxed text-fog">
        Submitting this form creates an enquiry — our team will call you to confirm availability,
        rates and details. This is not a booking confirmation.
      </p>

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
        {submitting ? "Sending…" : isGeneral ? "Send Message" : isEvent ? "Send Event Enquiry" : "Submit Enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required = false,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <span className="label-field">
          {label} {required && <span className="text-brass-deep" aria-hidden="true">*</span>}
        </span>
      </div>
      {children}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}