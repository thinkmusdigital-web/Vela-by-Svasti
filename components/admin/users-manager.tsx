"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/admin/ui";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: string;
  lastActiveAt: string | null;
}

const HEADERS = { "Content-Type": "application/json", "x-requested-with": "vela-admin-panel" } as const;

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RESERVATION_STAFF" as string,
    active: true,
  });
  const [formKey, setFormKey] = useState(0);

  function refresh() {
    router.refresh();
  }

  const notice = (text: string | null, isError = false) =>
    setMessage(text ? (isError ? `Error: ${text}` : text) : null);

  function openNew() {
    setEditingId("new");
    setForm({ name: "", email: "", password: "", role: "RESERVATION_STAFF", active: true });
    setFormKey((key) => key + 1);
  }

  function openEdit(user: UserRow) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, active: user.active });
    setFormKey((key) => key + 1);
  }

  async function save() {
    if (!form.name.trim()) {
      notice("Name is required", true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      notice("A valid email is required", true);
      return;
    }
    if (editingId === "new" && (form.password.length < 8 || form.password.length > 128)) {
      notice("Password must be 8–128 characters", true);
      return;
    }
    setBusy(true);
    notice(null);
    const body: Record<string, unknown> = { name: form.name.trim(), email: form.email.trim(), role: form.role, active: form.active };
    if (form.password) body.password = form.password;
    const url = editingId === "new" ? "/api/users" : `/api/users/${editingId}`;
    const method = editingId === "new" ? "POST" : "POST";
    try {
      const response = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) {
        notice(data?.message ?? "Save failed", true);
        return;
      }
      notice(editingId === "new" ? "User created." : "User updated.");
      setEditingId(null);
      refresh();
    } catch {
      notice("Could not reach the server", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {message && (
        <div className={`mb-6 border px-4 py-3 text-[0.85rem] ${message.startsWith("Error") ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <button type="button" onClick={openNew} className="btn-primary px-6 py-3">New user</button>
      </div>

      {editingId && (
        <div key={formKey} className="mb-8 border border-line bg-white p-6">
          <p className="label-field">{editingId === "new" ? "Create user" : "Edit user"}</p>
          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="label-field">Name *</label>
              <input className="input-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div>
              <label className="label-field">Email *</label>
              <input className="input-field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div>
              <label className="label-field">{editingId === "new" ? "Password *" : "Password (blank = keep)"}</label>
              <input type="password" className="input-field" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </div>
            <div>
              <label className="label-field">Role</label>
              <select className="input-field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input id="user-active" type="checkbox" className="h-4 w-4 accent-brass-deep" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            <label htmlFor="user-active" className="text-[0.85rem] text-stone">Active (can sign in)</label>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={save} disabled={busy} className="btn-primary px-6">{busy ? "Saving…" : editingId === "new" ? "Create user" : "Save changes"}</button>
            <button type="button" onClick={() => setEditingId(null)} className="btn-outline px-6">Cancel</button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="border border-line bg-white p-10 text-center text-[0.9rem] text-stone">No users found.</p>
      ) : (
        <div className="border border-line bg-white">
          <table className="w-full">
            <thead className="bg-sand/60">
              <tr>
                <th className="px-5 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Name</th>
                <th className="px-5 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Email</th>
                <th className="px-5 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Role</th>
                <th className="px-5 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Status</th>
                <th className="px-5 py-3 text-left text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-fog">Last active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-5 py-3 text-[0.85rem] font-medium text-ink">
                    {user.name}
                    {user.id === currentUserId && <span className="ml-2 text-[0.66rem] text-fog">(you)</span>}
                  </td>
                  <td className="px-5 py-3 text-[0.82rem] text-stone">{user.email}</td>
                  <td className="px-5 py-3 text-[0.82rem] text-stone">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}</td>
                  <td className="px-5 py-3">
                    <Badge tone={user.active ? "success" : "neutral"}>{user.active ? "Active" : "Disabled"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[0.8rem] text-fog">
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString("en-GB") : "Never"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={() => openEdit(user)} className="px-2 text-[0.72rem] font-semibold uppercase text-stone hover:text-ink">
                      Edit
                    </button>
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