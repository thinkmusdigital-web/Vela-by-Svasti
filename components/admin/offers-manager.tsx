"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/admin/ui";

export interface OfferRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
  roomType: { id: string; name: string } | null;
  terms: string;
  active: boolean;
  sortOrder: number;
  roomTypeId: string;
}

const HEADERS = { "Content-Type": "application/json", "x-requested-with": "vela-admin-panel" } as const;

function day(value: string | null): string {
  return value ?? "";
}

export function OffersManager({ offers, roomTypes }: { offers: OfferRow[]; roomTypes: { id: string; name: string }[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<OfferRow>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  function refresh() {
    router.refresh();
  }

  function openNew() {
    setEditingId("new");
    setDraft({ name: "", description: "", terms: "", validFrom: "", validUntil: "", imageUrl: "", roomTypeId: "" });
    setFormKey((key) => key + 1);
  }

  function openEdit(offer: OfferRow) {
    setEditingId(offer.id);
    setDraft({ ...offer, imageUrl: offer.imageUrl ?? "", roomTypeId: offer.roomType?.id ?? "" });
    setFormKey((key) => key + 1);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      name: draft.name,
      description: draft.description ?? "",
      terms: draft.terms ?? "",
      imageUrl: draft.imageUrl || null,
      validFrom: day(draft.validFrom ?? null),
      validUntil: day(draft.validUntil ?? null),
      roomTypeId: (draft.roomTypeId as string) || null,
      active: draft.active ?? true,
      sortOrder: draft.sortOrder ?? 0,
    };
    const method = editingId === "new" ? "POST" : "PATCH";
    const url = editingId === "new" ? "/api/offers" : `/api/offers/${editingId}`;
    try {
      const response = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message ?? "Save failed.");
        return;
      }
      setEditingId(null);
      refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(offer: OfferRow) {
    const response = await fetch(`/api/offers/${offer.id}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ active: !offer.active }),
    });
    if (response.ok) refresh();
  }

  async function remove(offer: OfferRow) {
    if (!window.confirm(`Delete offer “${offer.name}”?`)) return;
    const response = await fetch(`/api/offers/${offer.id}`, { method: "DELETE", headers: HEADERS });
    if (response.ok) refresh();
  }

  const expired = (offer: OfferRow) => offer.validUntil && offer.validUntil < new Date().toISOString().slice(0, 10);

  return (
    <div>
      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <button type="button" onClick={openNew} className="btn-primary px-6 py-3">New offer</button>
      </div>

      {editingId && (
        <form key={formKey} onSubmit={submit} className="mb-8 border border-line bg-white p-6">
          <p className="label-field">{editingId === "new" ? "Create offer" : "Edit offer"}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="label-field">Name *</label>
              <input className="input-field" value={draft.name ?? ""} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
            </div>
            <div>
              <label className="label-field">Image path</label>
              <input className="input-field" value={draft.imageUrl ?? ""} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="/uploads/… or /images/…" />
            </div>
            <div>
              <label className="label-field">Valid from</label>
              <input type="date" className="input-field" value={draft.validFrom ?? ""} onChange={(event) => setDraft({ ...draft, validFrom: event.target.value })} />
            </div>
            <div>
              <label className="label-field">Valid until</label>
              <input type="date" className="input-field" value={draft.validUntil ?? ""} onChange={(event) => setDraft({ ...draft, validUntil: event.target.value })} />
            </div>
            <div>
              <label className="label-field">Applicable room</label>
              <select className="input-field" value={(draft.roomTypeId as string) ?? ""} onChange={(event) => setDraft({ ...draft, roomTypeId: event.target.value })}>
                <option value="">All rooms</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Sort order</label>
              <input type="number" className="input-field" value={draft.sortOrder ?? 0} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} />
            </div>
            <div className="lg:col-span-2">
              <label className="label-field">Description</label>
              <textarea rows={3} className="input-field resize-y" value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <label className="label-field">Terms</label>
              <textarea rows={3} className="input-field resize-y" value={draft.terms ?? ""} onChange={(event) => setDraft({ ...draft, terms: event.target.value })} />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={busy || !draft.name} className="btn-primary px-6">{busy ? "Saving…" : editingId === "new" ? "Create" : "Save changes"}</button>
            <button type="button" onClick={() => setEditingId(null)} className="btn-outline px-6">Cancel</button>
          </div>
        </form>
      )}

      {offers.length === 0 ? (
        <p className="border border-line bg-white p-10 text-center text-[0.9rem] text-stone">
          No offers yet. Create your first offer to show it on the website.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.id} className={`border bg-white p-5 ${offer.active ? "border-line" : "border-line opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{offer.name}</p>
                  <p className="text-[0.72rem] text-fog">/{offer.slug}</p>
                </div>
                <Badge tone={offer.active ? (expired(offer) ? "muted" : "success") : "neutral"}>
                  {offer.active ? (expired(offer) ? "Expired" : "Live") : "Hidden"}
                </Badge>
              </div>
              <p className="mt-3 line-clamp-2 text-[0.82rem] leading-relaxed text-stone">{offer.description}</p>
              <p className="mt-2 text-[0.74rem] text-fog">
                {offer.validFrom || offer.validUntil
                  ? `${day(offer.validFrom) || "—"} → ${day(offer.validUntil) || "ongoing"}`
                  : "Ongoing"}
                {offer.roomType ? ` · ${offer.roomType.name}` : ""}
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => openEdit(offer)} className="btn-outline flex-1 px-3 py-1.5 text-[0.68rem]">Edit</button>
                <button type="button" onClick={() => toggleActive(offer)} className="btn-outline flex-1 px-3 py-1.5 text-[0.68rem]">{offer.active ? "Hide" : "Show"}</button>
                <button type="button" onClick={() => remove(offer)} className="px-3 py-1.5 text-[0.68rem] font-semibold uppercase text-red-700 hover:text-red-800">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}