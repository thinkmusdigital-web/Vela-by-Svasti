import { describe, expect, it } from "vitest";
import {
  buildEnquiryPayload,
  generateEnquiryReference,
  interpretSheetResponse,
  toDayString,
} from "@/lib/enquiry-payload";
import type { EnquiryInput } from "@/lib/validate";

/** Builds a complete EnquiryInput (zod infer keeps optional keys present). */
function input(overrides: Partial<EnquiryInput>): EnquiryInput {
  return {
    enquiryType: "STAY",
    customerName: "",
    mobileNumber: "9000000000",
    email: "test@example.com",
    checkInDate: undefined,
    checkOutDate: undefined,
    adults: 1,
    children: 0,
    roomTypeId: undefined,
    numberOfRooms: 1,
    purposeOfStay: undefined,
    specialRequest: undefined,
    preferredContact: "PHONE",
    companyName: undefined,
    eventType: undefined,
    expectedGuests: undefined,
    approximateBudget: undefined,
    preferredCallTime: undefined,
    ...overrides,
  };
}

const STAY_INPUT = input({
  customerName: "Rahul Sharma",
  mobileNumber: "9876543210",
  email: "rahul@example.com",
  checkInDate: new Date("2026-11-20T00:00:00.000Z"),
  checkOutDate: new Date("2026-11-22T00:00:00.000Z"),
  adults: 2,
  children: 1,
  roomTypeId: "room_1",
  purposeOfStay: "LEISURE",
  specialRequest: "  Early check-in  ",
  preferredContact: "PHONE",
});

describe("toDayString", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDayString(new Date("2026-11-20T00:00:00.000Z"))).toBe("2026-11-20");
  });

  it("returns an empty string when no date is given", () => {
    expect(toDayString()).toBe("");
    expect(toDayString(null)).toBe("");
  });
});

describe("generateEnquiryReference", () => {
  it("produces an ENQ-YYYYMMDD-XXXX reference", () => {
    const ref = generateEnquiryReference(new Date("2026-10-09T12:00:00.000Z"));
    expect(ref).toMatch(/^ENQ-20261009-[A-Z0-9]{4}$/);
  });
});

describe("buildEnquiryPayload", () => {
  it("maps form fields, formats dates and resolves labels", () => {
    const payload = buildEnquiryPayload(STAY_INPUT, { roomTypeName: "Deluxe Room" });

    expect(payload.customerName).toBe("Rahul Sharma");
    expect(payload.mobileNumber).toBe("9876543210");
    expect(payload.email).toBe("rahul@example.com");
    expect(payload.checkInDate).toBe("2026-11-20");
    expect(payload.checkOutDate).toBe("2026-11-22");
    expect(payload.adults).toBe(2);
    expect(payload.children).toBe(1);
    expect(payload.roomTypeId).toBe("room_1");
    expect(payload.roomType).toBe("Deluxe Room");
    expect(payload.numberOfRooms).toBe(1);
    expect(payload.purposeOfStay).toBe("Leisure");
    expect(payload.preferredContact).toBe("Phone call");
    expect(payload.source).toBe("Website");
    expect(payload.reference).toMatch(/^ENQ-/);
    expect(payload.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("normalises optional text fields and keeps only provided values", () => {
    const payload = buildEnquiryPayload(STAY_INPUT, {});
    expect(payload.specialRequest).toBe("Early check-in");
    expect(payload.roomType).toBe("");
  });

  it("handles EVENT enquiries and their labels", () => {
    const payload = buildEnquiryPayload(
      input({
        enquiryType: "EVENT",
        customerName: "Aisha Khan",
        mobileNumber: "9123456780",
        email: "aisha@example.com",
        checkInDate: new Date("2026-12-05T00:00:00.000Z"),
        eventType: "WEDDING",
        expectedGuests: 150,
        preferredContact: "WHATSAPP",
      }),
      {},
    );

    expect(payload.enquiryType).toBe("EVENT");
    expect(payload.eventType).toBe("Wedding");
    expect(payload.expectedGuests).toBe(150);
    expect(payload.checkOutDate).toBe("");
    expect(payload.preferredContact).toBe("WhatsApp");
  });

  it("handles GENERAL enquiries with no dates", () => {
    const payload = buildEnquiryPayload(
      input({
        enquiryType: "GENERAL",
        customerName: "Sam Patel",
        mobileNumber: "8765432109",
        email: "sam@example.com",
        preferredContact: "EMAIL",
        specialRequest: "Partnership question",
      }),
      {},
    );

    expect(payload.checkInDate).toBe("");
    expect(payload.checkOutDate).toBe("");
    expect(payload.purposeOfStay).toBe("");
    expect(payload.specialRequest).toBe("Partnership question");
  });

  it("keeps a caller-provided reference", () => {
    const payload = buildEnquiryPayload(STAY_INPUT, { reference: "ENQ-CUSTOM-1" });
    expect(payload.reference).toBe("ENQ-CUSTOM-1");
  });
});

describe("interpretSheetResponse", () => {
  const ok = (status: number, text: string) => ({ status, text });

  it.each([
    ['{"ok":true}', { ok: true }],
    ['{"success":true,"enquiryId":"ENQ-1"}', { ok: true, enquiryId: "ENQ-1" }],
    ['{"status":"success"}', { ok: true }],
    ['{"result":"created","reference":"ENQ-X"}', { ok: true, enquiryId: "ENQ-X" }],
    ['{"enquiryId":"1234"}', { ok: true, enquiryId: "1234" }],
    ["Success", { ok: true }],
    ["OK", { ok: true }],
  ])("accepts a confirmed save (%s)", (body: string, expected: { ok: boolean; enquiryId?: string }) => {
    const result = interpretSheetResponse(ok(200, body));
    expect(result.ok).toBe(true);
    if (expected.enquiryId) expect(result.enquiryId).toBe(expected.enquiryId);
  });

  it.each([
    ['{"ok":false,"error":"boom"}', "boom"],
    ['{"success":false}', "saving"],
    ['{"status":"error","message":"bad"}', "bad"],
  ])("rejects an explicit failure (%s)", (body, fragment) => {
    const result = interpretSheetResponse(ok(200, body));
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
    if (result.error) expect(result.error.toLowerCase()).toContain(fragment.toLowerCase());
  });

  it.each([
    ['{"unexpected":1}'],
    ["<html>Please sign in</html>"],
    [""],
  ])("rejects a non-confirming response (%j)", (body) => {
    const result = interpretSheetResponse(ok(200, body));
    expect(result.ok).toBe(false);
  });

  it("rejects non-2xx status codes", () => {
    expect(interpretSheetResponse(ok(500, "oops")).ok).toBe(false);
    expect(interpretSheetResponse(ok(302, "redirect")).ok).toBe(false);
  });
});