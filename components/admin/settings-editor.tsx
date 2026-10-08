"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface SettingField {
  key: string;
  label: string;
  value: string;
}

const HEADERS = { "Content-Type": "application/json", "x-requested-with": "vela-admin-panel" } as const;

export function SettingsEditor({
  contact,
  system,
}: {
  contact: { key: string; label: string; value: string; group: string }[];
  system: { key: string; label: string; value: string; type: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    [...contact, ...system].reduce<Record<string, string>>((acc, item) => {
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
    setBusy(true);
    setMessage(null);
    try {
      const contactItems = contact.map((item) => ({ key: item.key, value: values[item.key] ?? "" }));
      const systemItems = system
        .filter((item) => item.key !== "enquiry_counter")
        .map((item) => ({ key: item.key, value: values[item.key] ?? item.value }));

      const [a, b] = await Promise.all([
        fetch("/api/content", {
          method: "PUT",
          headers: HEADERS,
          body: JSON.stringify({ items: contactItems }),
        }),
        systemItems.length
          ? fetch("/api/settings", {
              method: "PUT",
              headers: HEADERS,
              body: JSON.stringify({ items: systemItems }),
            })
          : Promise.resolve({ ok: true } as Response),
      ]);

      if (!a.ok || !b.ok) {
        setMessage("Save failed. Please check the values and try again.");
        return;
      }
      setMessage("Settings saved. The site updates automatically.");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = (item: SettingField & { group?: string }, type?: string) => (
    <div key={item.key}>
      <label className="label-field" htmlFor={`setting-${item.key}`}>
        {item.label}
        {type !== "number" && (
          <span className="ml-1 font-normal normal-case tracking-normal text-fog">({item.key})</span>
        )}
      </label>
      {type === "number" ? (
        <div className="input-field flex items-center bg-sand text-fog">{item.value} (managed automatically)</div>
      ) : (
        <input
          id={`setting-${item.key}`}
          className="input-field"
          value={values[item.key] ?? ""}
          onChange={(event) => setValue(item.key, event.target.value)}
        />
      )}
    </div>
  );

  return (
    <div>
      {message && (
        <div className={`mb-6 border px-4 py-3 text-[0.85rem] ${message.startsWith("Save failed") ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-white">
          <header className="border-b border-line bg-sand/60 px-5 py-3">
            <h2 className="font-semibold uppercase tracking-[0.18em] text-[0.72rem] text-ink">Contact details</h2>
          </header>
          <div className="space-y-5 p-5">{contact.map((item) => input(item))}</div>
        </section>

        <section className="border border-line bg-white">
          <header className="border-b border-line bg-sand/60 px-5 py-3">
            <h2 className="font-semibold uppercase tracking-[0.18em] text-[0.72rem] text-ink">System</h2>
          </header>
          <div className="space-y-5 p-5">
            {system.length === 0 ? (
              <p className="text-[0.85rem] text-stone">No system settings yet.</p>
            ) : (
              system.map((item) => input(item, item.type))
            )}
          </div>
        </section>
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button type="button" onClick={save} disabled={busy} className="btn-primary px-8 py-3 shadow-lg">
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}