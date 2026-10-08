"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ContentField {
  key: string;
  label: string;
  value: string;
  type: string;
}

export interface ContentSection {
  group: string;
  items: ContentField[];
}

const HEADERS = { "Content-Type": "application/json", "x-requested-with": "vela-admin-panel" } as const;

function groupLabel(group: string): string {
  const map: Record<string, string> = {
    brand: "Brand",
    home: "Home page",
    rooms: "Rooms",
    dine: "Dining",
    wellness: "Wellness",
    leisure: "Leisure",
    events: "Events",
    experience: "Experience",
    about: "About",
    location: "Location",
    contact: "Contact",
    gallery: "Gallery",
    offers: "Offers",
    general: "General",
  };
  return map[group] ?? group.replace(/_/g, " ");
}

export function ContentEditor({ sections }: { sections: ContentSection[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    sections.flatMap((section) => section.items).reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {}),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function save() {
    const items = Object.entries(values).map(([key, value]) => ({ key, value }));
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({ items }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(`Save failed: ${data?.message ?? "Please try again."}`);
        return;
      }
      setMessage(`Saved ${data.count} content values. The site updates automatically.`);
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {message && (
        <div className={`mb-6 border px-4 py-3 text-[0.85rem] ${message.startsWith("Save failed") ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <section key={section.group} className="border border-line bg-white">
            <header className="border-b border-line bg-sand/60 px-5 py-3">
              <h2 className="font-semibold uppercase tracking-[0.18em] text-[0.72rem] text-ink">
                {groupLabel(section.group)}
              </h2>
            </header>
            <div className="space-y-5 p-5">
              {section.items.map((item) => {
                const value = values[item.key] ?? "";
                const shared = {
                  value,
                  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setValue(item.key, event.target.value),
                };
                return (
                  <div key={item.key}>
                    <label className="label-field" htmlFor={`content-${item.key}`}>
                      {item.label}
                      <span className="ml-1 font-normal normal-case tracking-normal text-fog">({item.key})</span>
                    </label>
                    {item.type === "textarea" || item.type === "json" ? (
                      <textarea
                        id={`content-${item.key}`}
                        rows={item.type === "json" ? 4 : 3}
                        className="input-field resize-y"
                        {...shared}
                      />
                    ) : item.type === "boolean" ? (
                      <input
                        id={`content-${item.key}`}
                        type="checkbox"
                        className="h-4 w-4 accent-brass-deep"
                        checked={value === "true"}
                        onChange={(event) => setValue(item.key, String(event.target.checked))}
                      />
                    ) : item.type === "image" ? (
                      <div className="flex gap-3">
                        <input id={`content-${item.key}`} className="input-field" {...shared} />
                        {value && /^\/(images|uploads)\//.test(value) && (
                          <img src={value} alt="" className="h-11 w-20 shrink-0 border border-line object-cover" />
                        )}
                      </div>
                    ) : (
                      <input id={`content-${item.key}`} className="input-field" {...shared} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button type="button" onClick={save} disabled={busy} className="btn-primary px-8 py-3 shadow-lg">
          {busy ? "Saving…" : "Save all content"}
        </button>
      </div>
    </div>
  );
}