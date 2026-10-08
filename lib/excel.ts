import * as XLSX from "xlsx";
import {
  CALL_STATUS_LABELS,
  ENQUIRY_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  PREFERRED_CONTACT_LABELS,
  PURPOSE_LABELS,
  type CallStatus,
  type EnquiryStatus,
} from "@/lib/constants";
import { formatDay, formatDateTime } from "@/lib/format";

/** Column order matches Vela_By_Svasti_Hotel_Enquiry_Tracker.xlsx */
export const EXPORT_HEADERS = [
  "Enquiry ID",
  "Enquiry Date",
  "Customer Name",
  "Mobile Number",
  "Email",
  "Check-in Date",
  "Check-out Date",
  "Adults",
  "Children",
  "Room Type",
  "No. of Rooms",
  "Purpose of Stay",
  "Special Request",
  "Preferred Contact",
  "Enquiry Source",
  "Assigned Staff",
  "Call Status",
  "Follow-up Date",
  "Customer Response",
  "Quotation Amount",
  "Final Status",
  "Remarks",
  "Last Contacted",
  "Created At",
  "Updated At",
] as const;

export interface ExportableEnquiry {
  enquiryId: string;
  createdAt: Date;
  customerName: string;
  mobileNumber: string;
  email: string;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  adults: number;
  children: number;
  roomType: { name: string } | null;
  numberOfRooms: number;
  purposeOfStay: string | null;
  specialRequest: string | null;
  preferredContact: string;
  source: string;
  assignedStaff: { name: string } | null;
  callStatus: string;
  followUpDate: Date | null;
  customerResponse: string | null;
  quotationAmount: number | null;
  finalStatus: string;
  remarks: string | null;
  lastContactedAt: Date | null;
  updatedAt: Date;
}

function label(map: Record<string, string>, value: string | null): string {
  if (!value) return "";
  return map[value] ?? value;
}

export function enquiryToRow(enquiry: ExportableEnquiry): (string | number)[] {
  return [
    enquiry.enquiryId,
    formatDay(enquiry.createdAt),
    enquiry.customerName,
    enquiry.mobileNumber,
    enquiry.email,
    formatDay(enquiry.checkInDate, ""),
    formatDay(enquiry.checkOutDate, ""),
    enquiry.adults,
    enquiry.children,
    enquiry.roomType?.name ?? "",
    enquiry.numberOfRooms,
    label(PURPOSE_LABELS, enquiry.purposeOfStay),
    enquiry.specialRequest ?? "",
    label(PREFERRED_CONTACT_LABELS, enquiry.preferredContact),
    enquiry.source,
    enquiry.assignedStaff?.name ?? "",
    label(CALL_STATUS_LABELS, enquiry.callStatus as CallStatus),
    formatDay(enquiry.followUpDate, ""),
    enquiry.customerResponse ?? "",
    enquiry.quotationAmount ?? "",
    label(ENQUIRY_STATUS_LABELS, enquiry.finalStatus as EnquiryStatus),
    enquiry.remarks ?? "",
    formatDateTime(enquiry.lastContactedAt, ""),
    formatDateTime(enquiry.createdAt),
    formatDateTime(enquiry.updatedAt),
  ];
}

export function buildEnquiryWorkbook(enquiries: ExportableEnquiry[]): XLSX.WorkBook {
  const rows = enquiries.map(enquiryToRow);
  const worksheet = XLSX.utils.aoa_to_sheet([[...EXPORT_HEADERS], ...rows]);

  worksheet["!cols"] = EXPORT_HEADERS.map((header) => {
    const sample = rows.reduce((max, row) => {
      const index = EXPORT_HEADERS.indexOf(header);
      const value = String(row[index] ?? "");
      return Math.max(max, value.length);
    }, header.length);
    return { wch: Math.min(Math.max(sample + 2, 12), 48) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");
  return workbook;
}

export function enquiryWorkbookFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `Vela_By_Svasti_Hotel_Enquiry_Tracker_${stamp}.xlsx`;
}

export function serializeWorkbook(workbook: XLSX.WorkBook): Buffer {
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function exportFileName(base: string): string {
  const safe = base.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-");
  const stamp = new Date().toISOString().slice(0, 10);
  return `${safe || "enquiries"}_${stamp}.xlsx`;
}

export function enquiryEventTypeLabel(value: string | null): string {
  return value ? (EVENT_TYPE_LABELS[value] ?? value) : "";
}
