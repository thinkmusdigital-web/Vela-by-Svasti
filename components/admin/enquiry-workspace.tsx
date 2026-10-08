"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Card } from "@/components/admin/ui";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  CALL_STATUSES,
  CALL_STATUS_LABELS,
} from "@/lib/constants";

export interface WorkspaceEnquiry {
  id: number;
  enquiryId: string;
  enquiryType: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  numberOfRooms: number;
  adults: number;
  children: number;
  roomType: { id: string; name: string } | null;
  finalStatus: string;
  callStatus: string;
  followUpDate: string | null;
  customerResponse: string | null;
  remarks: string | null;
  quotationAmount: number | null;
  lastContactedAt: string | null;
  assignedStaffId: string | null;
  assignedStaff: { id: string; name: string } | null;
  isPossibleDuplicate: boolean;
  duplicateOfId: number | null;
  followups: {
    id: string;
    note: string;
    followUpDate: string | null;
    completedAt: string | null;
    createdAt: string;
    createdBy: string;
  }[];
}

interface LogEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  userLabel: string;
  createdAt: string;
}

const HEADERS = { "Content-Type": "application/json", "x-requested-with": "vela-admin-panel" } as const;

function fmt(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function dayLabel(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return `${value} (overdue)`;
  if (diff === 0) return `${value} (today)`;
  return value;
}

export function EnquiryWorkspace({
  enquiry,
  staff,
  duplicates,
  activityLogs,
  canManage,
}: {
  enquiry: WorkspaceEnquiry;
  staff: { id: string; name: string }[];
  duplicates: { id: number; enquiryId: string; customerName: string; createdAt: string }[];
  activityLogs: LogEntry[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(enquiry.finalStatus);
  const [assignedId, setAssignedId] = useState(enquiry.assignedStaffId ?? "");
  const [callStatus, setCallStatus] = useState(enquiry.callStatus);
  const [called, setCalled] = useState(false);
  const [customerResponse, setCustomerResponse] = useState(enquiry.customerResponse ?? "");
  const [remarks, setRemarks] = useState(enquiry.remarks ?? "");
  const [quotationAmount, setQuotationAmount] = useState(enquiry.quotationAmount?.toString() ?? "");
  const [followUpDate, setFollowUpDate] = useState(enquiry.followUpDate ?? "");
  const [note, setNote] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");

  function refresh() {
    router.refresh();
  }

  function toast(message: string) {
    setError(message);
  }

  async function api(path: string, method: string, body: unknown): Promise<Response> {
    return fetch(path, { method, headers: HEADERS, body: JSON.stringify(body) });
  }

  async function run(path: string, method: string, body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const response = await api(path, method, body);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.message ?? "Something went wrong. Please try again.");
        return false;
      }
      return true;
    } catch {
      setError("Could not reach the server. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveStatus() {
    if (!canManage || status === enquiry.finalStatus) return;
    const ok = await run(`/api/enquiries/${enquiry.id}/status`, "PATCH", { finalStatus: status });
    if (ok) refresh();
  }

  async function saveAssign() {
    if (!canManage) return;
    const ok = await run(`/api/enquiries/${enquiry.id}/assign`, "PATCH", {
      assignedStaffId: assignedId || null,
    });
    if (ok) refresh();
  }

  async function saveCall() {
    if (!canManage) return;
    const payload: Record<string, unknown> = {
      callStatus: called && callStatus === enquiry.callStatus ? "CALLED" : callStatus,
      calledAt: called,
    };
    if (customerResponse !== (enquiry.customerResponse ?? "")) payload.customerResponse = customerResponse;
    if (remarks !== (enquiry.remarks ?? "")) payload.remarks = remarks;
    if (quotationAmount !== (enquiry.quotationAmount?.toString() ?? "")) {
      payload.quotationAmount = quotationAmount === "" ? null : Number(quotationAmount);
    }
    if (followUpDate !== (enquiry.followUpDate ?? "")) payload.followUpDate = followUpDate || null;

    const keys = Object.keys(payload).filter((key) => key !== "calledAt");
    if (keys.length === 0) {
      toast("Nothing to save — update at least one field.");
      return;
    }
    const ok = await run(`/api/enquiries/${enquiry.id}/call`, "PATCH", payload);
    if (ok) refresh();
  }

  async function addFollowUp() {
    if (!canManage || !note.trim()) {
      if (!note.trim()) toast("Write a short note first.");
      return;
    }
    const ok = await run(`/api/enquiries/${enquiry.id}/follow-up`, "POST", {
      note,
      followUpDate: newFollowUpDate || null,
    });
    if (ok) {
      setNote("");
      setNewFollowUpDate("");
      refresh();
    }
  }

  async function completeFollowUp(id: string) {
    if (!canManage) return;
    const ok = await run(`/api/enquiries/${enquiry.id}/follow-up`, "POST", { note: "", completeFollowUpId: id });
    if (ok) refresh();
  }

  async function removeEnquiry() {
    if (!canManage) return;
    if (!window.confirm(`Delete ${enquiry.enquiryId}? This hides it from lists but keeps the record for audits.`)) return;
    const ok = await run(`/api/enquiries/${enquiry.id}`, "DELETE", {});
    if (ok) {
      router.replace("/admin/enquiries");
      router.refresh();
    }
  }

  const isOpen = ["NEW", "CONTACTED", "FOLLOW_UP", "QUOTATION_SENT"].includes(enquiry.finalStatus);

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Final status</p>
            <Badge tone={status === "CONVERTED" ? "success" : status === "LOST" || status === "CLOSED" ? "muted" : status === "NEW" ? "warn" : "neutral"}>
              {ENQUIRY_STATUS_LABELS[status as keyof typeof ENQUIRY_STATUS_LABELS]}
            </Badge>
          </div>
          {canManage ? (
            <>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={busy}
                className="input-field mt-3"
              >
                {ENQUIRY_STATUSES.map((value) => (
                  <option key={value} value={value}>{ENQUIRY_STATUS_LABELS[value]}</option>
                ))}
              </select>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[0.72rem] text-stone">
                  {isOpen ? "Still active — keep it updated as you follow up." : "Closed. No further action expected."}
                </p>
                {status !== enquiry.finalStatus && (
                  <button type="button" onClick={saveStatus} disabled={busy} className="btn-primary px-5 py-2">
                    Save
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 text-[0.85rem] text-stone">{ENQUIRY_STATUS_LABELS[enquiry.finalStatus as keyof typeof ENQUIRY_STATUS_LABELS]}</p>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Assigned to</p>
          {canManage ? (
            <>
              <select
                value={assignedId}
                onChange={(event) => setAssignedId(event.target.value)}
                disabled={busy}
                className="input-field mt-3"
              >
                <option value="">Unassigned</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <div className="mt-3 flex justify-end">
                {assignedId !== (enquiry.assignedStaffId ?? "") && (
                  <button type="button" onClick={saveAssign} disabled={busy} className="btn-primary px-5 py-2">
                    Save
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 text-[0.85rem] text-ink">{enquiry.assignedStaff?.name ?? "Unassigned"}</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Call update</p>
        <p className="mt-1 text-[0.8rem] text-stone">
          {enquiry.lastContactedAt ? `Last contacted ${fmt(enquiry.lastContactedAt)}` : "Customer has not been contacted yet."}
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <label htmlFor="callStatus" className="label-field">Call status</label>
            <select
              id="callStatus"
              value={callStatus}
              onChange={(event) => setCallStatus(event.target.value)}
              disabled={!canManage || busy}
              className="input-field"
            >
              {CALL_STATUSES.map((value) => (
                <option key={value} value={value}>{CALL_STATUS_LABELS[value]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="followUpDate" className="label-field">Next follow-up</label>
            <input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              disabled={!canManage || busy}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="quotationAmount" className="label-field">Quotation amount (₹)</label>
            <input
              id="quotationAmount"
              type="number"
              min={0}
              step="any"
              value={quotationAmount}
              onChange={(event) => setQuotationAmount(event.target.value)}
              disabled={!canManage || busy}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="customerResponse" className="label-field">Customer response</label>
            <textarea
              id="customerResponse"
              rows={3}
              value={customerResponse}
              onChange={(event) => setCustomerResponse(event.target.value)}
              disabled={!canManage || busy}
              className="input-field resize-y"
            />
          </div>
          <div>
            <label htmlFor="remarks" className="label-field">Remarks</label>
            <textarea
              id="remarks"
              rows={3}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              disabled={!canManage || busy}
              className="input-field resize-y"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex items-center gap-2">
            <input
              id="called"
              type="checkbox"
              checked={called}
              onChange={(event) => setCalled(event.target.checked)}
              disabled={!canManage || busy}
              className="h-4 w-4 accent-brass-deep"
            />
            <label htmlFor="called" className="text-[0.85rem] text-stone">
              Mark as contacted just now
            </label>
          </div>
          <div className="lg:justify-self-end">
            {canManage && (
              <button type="button" onClick={saveCall} disabled={busy} className="btn-primary w-full px-6">
                {busy ? "Saving…" : "Save call update"}
              </button>
            )}
          </div>
        </div>

        {quotationAmount && (
          <p className="mt-4 border-t border-line pt-3 text-[0.8rem] text-stone">
            Current quotation:{' '}
            <span className="font-semibold text-ink">
              ₹{Number(quotationAmount).toLocaleString("en-IN")}
            </span>
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Add a follow-up</p>
          {canManage ? (
            <>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What will happen next — e.g. 'Call again on Saturday evening.'"
                className="input-field mt-4 resize-y"
              />
              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="newFollowUpDate" className="label-field">Due date</label>
                  <input
                    id="newFollowUpDate"
                    type="date"
                    value={newFollowUpDate}
                    onChange={(event) => setNewFollowUpDate(event.target.value)}
                    className="input-field"
                  />
                </div>
                <button type="button" onClick={addFollowUp} disabled={busy} className="btn-brass px-6 py-2.5">
                  Raise follow-up
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-[0.85rem] text-stone">You can view but not edit follow-ups.</p>
          )}
          {enquiry.followups.length > 0 && (
            <ul className="mt-5 space-y-3">
              {enquiry.followups.map((followup) => (
                <li key={followup.id} className={`border border-line p-3.5 ${followup.completedAt ? "bg-sand/50" : "bg-cream"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.85rem] leading-relaxed text-ink">{followup.note || <span className="text-fog">(no note)</span>}</p>
                      <p className="mt-1 text-[0.72rem] text-fog">
                        {followup.createdBy} · {fmt(followup.createdAt)}
                        {followup.followUpDate ? ` · due ${dayLabel(followup.followUpDate)}` : ""}
                        {followup.completedAt ? ` · completed ${fmt(followup.completedAt)}` : ""}
                      </p>
                    </div>
                    {canManage && !followup.completedAt && (
                      <button
                        type="button"
                        onClick={() => completeFollowUp(followup.id)}
                        disabled={busy}
                        className="btn-outline shrink-0 px-4 py-1.5 text-[0.68rem]"
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">History</p>
          {activityLogs.length === 0 ? (
            <p className="mt-4 text-[0.85rem] text-stone">No activity recorded yet.</p>
          ) : (
            <ol className="mt-4 space-y-0">
              {activityLogs.map((log, index) => (
                <li key={log.id} className="relative border-l border-line pb-4 pl-5 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brass" />
                  <p className="text-[0.8rem] font-semibold uppercase tracking-wide text-stone">{log.action}</p>
                  {log.newValue && <p className="mt-0.5 text-[0.85rem] text-ink">{log.newValue}</p>}
                  {log.oldValue && (
                    <p className="text-[0.78rem] text-fog">From: {log.oldValue}</p>
                  )}
                  <p className="mt-0.5 text-[0.72rem] text-fog">{log.userLabel} · {fmt(log.createdAt)}</p>
                  {index !== activityLogs.length - 1 && null}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {duplicates.length > 0 && (
        <Card className="p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">
            Possible duplicates
          </p>
          <p className="mt-1 text-[0.8rem] text-stone">
            Same mobile or email on other live enquiries — review before quoting.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {duplicates.map((duplicate) => (
              <li key={duplicate.id} className="flex items-center justify-between py-2.5">
                <p className="text-[0.85rem] text-ink">
                  <Link href={`/admin/enquiries/${duplicate.id}`} className="font-medium hover:text-brass-deep">
                    {duplicate.enquiryId}
                  </Link>
                  <span className="text-stone"> · {duplicate.customerName} </span>
                  <span className="text-fog">· {fmt(duplicate.createdAt)}</span>
                </p>
                <Link href={`/admin/enquiries/${duplicate.id}`} className="link-underline text-[0.78rem]">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {canManage && (
        <div className="flex justify-end border-t border-line pt-6">
          <button
            type="button"
            onClick={removeEnquiry}
            disabled={busy}
            className="border border-red-200 px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-red-700 hover:bg-red-50"
          >
            Delete enquiry
          </button>
        </div>
      )}
    </div>
  );
}