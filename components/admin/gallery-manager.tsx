"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS } from "@/lib/constants";

export interface GalleryImageRow {
  id: string;
  title: string | null;
  alt: string;
  category: string;
  url: string;
  sortOrder: number;
  active: boolean;
}

const HEADERS = { "x-requested-with": "vela-admin-panel" } as const;

export function GalleryManager({ images }: { images: GalleryImageRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("HOTEL");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Update failed.");
      }
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this image from the gallery?")) return;
    setBusy(true);
    setError(null);
    try {
      await fetch(`/api/gallery/${id}`, { method: "DELETE", headers: HEADERS });
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (!alt.trim()) {
      setError("Describe the image in the alt text field first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const upload = await fetch("/api/uploads", { method: "POST", headers: HEADERS, body: form });
      const uploadData = await upload.json();
      if (!upload.ok || !uploadData?.url) {
        setError(uploadData?.message ?? "Upload failed.");
        return;
      }
      const create = await fetch("/api/gallery", {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadData.url, alt: alt.trim(), category }),
      });
      const createData = await create.json();
      if (!create.ok) {
        setError(createData?.message ?? "Could not add image to gallery.");
        return;
      }
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="mb-6 border border-line bg-white p-5">
        <p className="label-field">Upload a new gallery image</p>
        <div className="grid gap-3 lg:grid-cols-[auto_1fr_1fr_auto]">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="text-[0.8rem] text-stone" />
          <input
            placeholder="Alt text (required, describes the photo)"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className="input-field"
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field">
            {GALLERY_CATEGORIES.map((value) => (
              <option key={value} value={value}>{GALLERY_CATEGORY_LABELS[value]}</option>
            ))}
          </select>
          <button type="button" onClick={upload} disabled={busy || !alt.trim()} className="btn-primary px-6">
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <figure key={image.id} className={`border bg-white ${image.active ? "border-line" : "border-line opacity-60"}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
              {!image.active && (
                <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-cream">
                  Hidden
                </span>
              )}
            </div>
            <figcaption className="border-t border-line p-3">
              {editing === image.id ? (
                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const data = new FormData(form);
                    patch(image.id, {
                      alt: String(data.get("alt")),
                      title: String(data.get("title") ?? "") || null,
                      category: String(data.get("category")),
                      sortOrder: Number(data.get("sortOrder")) || 0,
                    });
                    setEditing(null);
                  }}
                >
                  <input name="title" defaultValue={image.title ?? ""} placeholder="Title" className="input-field" />
                  <input name="alt" defaultValue={image.alt} placeholder="Alt text" className="input-field" />
                  <select name="category" defaultValue={image.category} className="input-field">
                    {GALLERY_CATEGORIES.map((value) => (
                      <option key={value} value={value}>{GALLERY_CATEGORY_LABELS[value]}</option>
                    ))}
                  </select>
                  <input name="sortOrder" type="number" defaultValue={image.sortOrder} className="input-field" />
                  <div className="flex justify-between pt-1">
                    <button type="submit" className="btn-primary px-4 py-1.5 text-[0.68rem]" disabled={busy}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="btn-outline px-4 py-1.5 text-[0.68rem]">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-[0.85rem] font-medium text-ink">{image.title || "Untitled"}</p>
                  <p className="mt-0.5 text-[0.72rem] text-fog">
                    {GALLERY_CATEGORY_LABELS[image.category as keyof typeof GALLERY_CATEGORY_LABELS] ?? image.category}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" onClick={() => setEditing(image.id)} className="link-underline text-[0.75rem]">
                      Edit
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => patch(image.id, { active: !image.active })}
                        className="text-[0.75rem] text-stone hover:text-ink"
                        disabled={busy}
                      >
                        {image.active ? "Hide" : "Show"}
                      </button>
                      <button type="button" onClick={() => remove(image.id)} className="text-[0.75rem] text-red-700 hover:text-red-800" disabled={busy}>
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}