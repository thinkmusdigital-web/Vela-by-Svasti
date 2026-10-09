"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/admin/ui";

export interface RoomTypeRow {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sizeSqft: number | null;
  bedType: string;
  maxOccupancy: number;
  displayOrder: number;
  active: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  amenities: { id: string; name: string }[];
  images: { id: string; url: string; alt: string; sortOrder: number }[];
  rooms: { id: string; roomNumber: string; floor: string | null; active: boolean; notes: string | null }[];
}

const HEADERS = { "x-requested-with": "vela-admin-panel" } as const;
const JSON_HEADERS = { ...HEADERS, "Content-Type": "application/json" } as const;

export function RoomsManager({ roomTypes }: { roomTypes: RoomTypeRow[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = roomTypes.find((type) => type.id === selectedId) ?? null;

  function refresh() {
    router.refresh();
  }

  const notice = (text: string | null, isError = false) =>
    setMessage(text ? (isError ? `Error: ${text}` : text) : null);

  return (
    <div>
      {message && (
        <div className={`mb-6 border px-4 py-3 text-[0.85rem] ${message.startsWith("Error") ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="btn-primary px-6 py-3"
          onClick={() => {
            setCreating(true);
            setSelectedId(null);
          }}
        >
          New room type
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-2">
          {creating && (
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="w-full border border-brass bg-brass/10 px-4 py-3 text-left"
            >
              <p className="text-[0.85rem] font-semibold text-brass-deep">+ New room type</p>
            </button>
          )}
          {roomTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSelectedId(type.id);
                setCreating(false);
              }}
              className={`w-full border px-4 py-3 text-left transition-colors ${
                selectedId === type.id ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink"
              }`}
            >
              <p className="flex items-center justify-between text-[0.9rem] font-medium">
                {type.name}
                <span className={`${selectedId === type.id ? "text-cream/70" : "text-fog"} text-[0.68rem]`}>
                  {type.rooms.filter((room) => room.active).length} rooms
                </span>
              </p>
              <p className={`text-[0.72rem] ${selectedId === type.id ? "text-cream/70" : "text-fog"}`}>/{type.slug}</p>
            </button>
          ))}
        </aside>

        <div>
          {creating ? (
            <RoomTypeForm key="new" mode="new" type={null} onSaved={(id) => { setCreating(false); setSelectedId(id); }} notice={notice} refresh={refresh} />
          ) : selected ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="display text-2xl text-ink">{selected.name}</h2>
                <Badge tone={selected.active ? "success" : "neutral"}>{selected.active ? "Visible on site" : "Hidden"}</Badge>
              </div>
              <RoomTypeForm key={selected.id} mode="edit" type={selected} onSaved={() => {}} notice={notice} refresh={refresh} />
              <RoomsUnits roomTypeId={selected.id} rooms={selected.rooms} notice={notice} refresh={refresh} />
            </div>
          ) : (
            <p className="border border-line bg-white p-10 text-center text-[0.9rem] text-stone">
              Select a room type on the left to edit it, or create a new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomTypeForm({
  mode,
  type,
  onSaved,
  notice,
  refresh,
}: {
  mode: "new" | "edit";
  type: RoomTypeRow | null;
  onSaved: (id: string) => void;
  notice: (text: string | null, isError?: boolean) => void;
  refresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [localBusy, setLocalBusy] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    sizeSqft: string;
    bedType: string;
    maxOccupancy: string;
    displayOrder: string;
    active: boolean;
    seoTitle: string;
    seoDescription: string;
    amenities: string;
    images: { url: string; alt: string }[];
  }>({
    name: type?.name ?? "",
    slug: type?.slug ?? "",
    shortDescription: type?.shortDescription ?? "",
    description: type?.description ?? "",
    sizeSqft: type?.sizeSqft?.toString() ?? "",
    bedType: type?.bedType ?? "",
    maxOccupancy: type?.maxOccupancy.toString() ?? "2",
    displayOrder: type?.displayOrder.toString() ?? "0",
    active: type?.active ?? true,
    seoTitle: type?.seoTitle ?? "",
    seoDescription: type?.seoDescription ?? "",
    amenities: type?.amenities.map((a) => a.name).join("\n") ?? "",
    images: type?.images.map((image) => ({ url: image.url, alt: image.alt })) ?? [],
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLocalBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", headers: HEADERS, body: formData });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        notice(data?.message ?? "Upload failed", true);
        return;
      }
      set("images", [...form.images, { url: data.url, alt: "" }]);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      notice("Upload failed", true);
    } finally {
      setLocalBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalBusy(true);
    notice(null);
    const body = {
      name: form.name,
      slug: form.slug || undefined,
      shortDescription: form.shortDescription,
      description: form.description,
      sizeSqft: form.sizeSqft === "" ? null : Number(form.sizeSqft),
      bedType: form.bedType,
      maxOccupancy: Number(form.maxOccupancy),
      displayOrder: Number(form.displayOrder),
      active: form.active,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      amenities: form.amenities.split("\n").map((item) => item.trim()).filter(Boolean),
      images: form.images.filter((image) => image.url),
    };
    try {
      const url = mode === "new" ? "/api/room-types" : `/api/room-types/${type?.id}`;
      const response = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        notice(data?.message ?? "Save failed", true);
        return;
      }
      notice(mode === "new" ? "Room type created." : "Room type saved.");
      if (mode === "new" && data?.roomType?.id) {
        onSaved(data.roomType.id);
      }
      refresh();
    } catch {
      notice("Could not reach the server", true);
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="border border-line bg-white p-6">
        <p className="label-field">Details</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label-field">Name *</label>
            <input className="input-field" value={form.name} onChange={(event) => set("name", event.target.value)} required />
          </div>
          <div>
            <label className="label-field">URL slug</label>
            <input className="input-field" value={form.slug} onChange={(event) => set("slug", event.target.value)} placeholder="auto from name" />
          </div>
          <div className="lg:col-span-2">
            <label className="label-field">Short description (card)</label>
            <textarea rows={2} className="input-field resize-y" value={form.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className="label-field">Full description</label>
            <textarea rows={5} className="input-field resize-y" value={form.description} onChange={(event) => set("description", event.target.value)} />
          </div>
          <div>
            <label className="label-field">Size (sq ft)</label>
            <input type="number" className="input-field" value={form.sizeSqft} onChange={(event) => set("sizeSqft", event.target.value)} />
          </div>
          <div>
            <label className="label-field">Bed type</label>
            <input className="input-field" value={form.bedType} onChange={(event) => set("bedType", event.target.value)} placeholder="King bed, Twin beds…" />
          </div>
          <div>
            <label className="label-field">Max occupancy</label>
            <input type="number" className="input-field" value={form.maxOccupancy} onChange={(event) => set("maxOccupancy", event.target.value)} />
          </div>
          <div>
            <label className="label-field">Display order</label>
            <input type="number" className="input-field" value={form.displayOrder} onChange={(event) => set("displayOrder", event.target.value)} />
          </div>
          <div className="flex items-center gap-2 lg:col-span-2">
            <input id="rt-active" type="checkbox" className="h-4 w-4 accent-brass-deep" checked={form.active} onChange={(event) => set("active", event.target.checked)} />
            <label htmlFor="rt-active" className="text-[0.85rem] text-stone">Visible on the website</label>
          </div>
          <div>
            <label className="label-field">SEO title</label>
            <input className="input-field" value={form.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} />
          </div>
          <div>
            <label className="label-field">SEO description</label>
            <input className="input-field" value={form.seoDescription} onChange={(event) => set("seoDescription", event.target.value)} />
          </div>
        </div>
      </div>

      <div className="border border-line bg-white p-6">
        <p className="label-field">Amenities — one per line</p>
        <textarea rows={4} className="input-field resize-y" value={form.amenities} onChange={(event) => set("amenities", event.target.value)} />
      </div>

      <div className="border border-line bg-white p-6">
        <p className="label-field">Photos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {form.images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="border border-line p-2">
              <img src={image.url} alt="" className="aspect-[16/10] w-full border border-line object-cover" />
              <input
                className="input-field mt-2 !px-2 !py-1 text-[0.75rem]"
                value={image.alt}
                onChange={(event) => {
                  const images = [...form.images];
                  images[index] = { ...images[index], alt: event.target.value };
                  set("images", images);
                }}
                placeholder="Alt text"
              />
              <div className="mt-1 flex justify-end">
                <button type="button" onClick={() => set("images", form.images.filter((_, i) => i !== index))} className="px-2 py-1 text-[0.7rem] font-semibold uppercase text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))}
          <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-sand text-center text-[0.8rem] text-stone hover:border-brass-deep">
            {localBusy ? "Uploading…" : "Upload a photo"}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadImage} />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={localBusy || !form.name} className="btn-primary px-6">
          {localBusy ? "Saving…" : mode === "new" ? "Create room type" : "Save room type"}
        </button>
      </div>
    </form>
  );
}

function RoomsUnits({
  roomTypeId,
  rooms,
  notice,
  refresh,
}: {
  roomTypeId: string;
  rooms: RoomTypeRow["rooms"];
  notice: (text: string | null, isError?: boolean) => void;
  refresh: () => void;
}) {
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");

  async function add() {
    if (!roomNumber.trim()) {
      notice("Enter a room number", true);
      return;
    }
    notice(null);
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ roomTypeId, roomNumber: roomNumber.trim(), floor: floor || null, notes: notes || null }),
    });
    const data = await response.json();
    if (!response.ok) {
      notice(data?.message ?? "Could not add room", true);
      return;
    }
    setRoomNumber("");
    setFloor("");
    setNotes("");
    refresh();
  }

  async function patchRoom(id: string, body: Record<string, unknown>) {
    notice(null);
    const response = await fetch(`/api/rooms/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) notice(data?.message ?? "Update failed", true);
    refresh();
  }

  return (
    <div className="border border-line bg-white p-6">
      <p className="label-field">Room units — inventory for this type</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
        <input className="input-field" placeholder="Room number *" value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} />
        <input className="input-field" placeholder="Floor" value={floor} onChange={(event) => setFloor(event.target.value)} />
        <input className="input-field" placeholder="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <button type="button" onClick={add} className="btn-primary px-5">Add</button>
      </div>

      {rooms.length === 0 ? (
        <p className="mt-4 border-t border-line pt-4 text-[0.85rem] text-fog">
          No units yet. Add room numbers (101, 102…) so inventory is ready for the future booking engine.
        </p>
      ) : (
        <div className="mt-4 border-t border-line pt-2">
          <table className="w-full">
            <thead className="bg-sand/60">
              <tr>
                <th className="px-3 py-2 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Room</th>
                <th className="px-3 py-2 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Floor</th>
                <th className="px-3 py-2 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Status</th>
                <th className="px-3 py-2 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Notes</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className={room.active ? "" : "opacity-50"}>
                  <td className="px-3 py-2 text-[0.85rem]">
                    {editingId === room.id ? (
                      <input className="input-field !px-2 !py-1 text-[0.8rem]" value={editNumber} onChange={(event) => setEditNumber(event.target.value)} />
                    ) : (
                      <span className="font-medium text-ink">{room.roomNumber}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[0.85rem] text-stone">{room.floor ?? "—"}</td>
                  <td className="px-3 py-2 text-[0.85rem]">
                    <button
                      type="button"
                      className={room.active ? "font-semibold text-emerald-700" : "text-fog"}
                      onClick={() => patchRoom(room.id, { active: !room.active })}
                      
                    >
                      {room.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-[0.8rem] text-fog">{room.notes ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    {editingId === room.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            patchRoom(room.id, { roomNumber: editNumber });
                            setEditingId(null);
                          }}
                          className="px-2 text-[0.72rem] font-semibold uppercase text-brass-deep"
                        >
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-2 text-[0.72rem] uppercase text-fog">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(room.id);
                          setEditNumber(room.roomNumber);
                        }}
                        className="px-2 text-[0.72rem] font-semibold uppercase text-stone hover:text-ink"
                      >
                        Rename
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}