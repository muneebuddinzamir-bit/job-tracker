"use client";

import { useState } from "react";
import { supabase, STATUSES, type Job, type Status } from "@/lib/supabase";

type Props = {
  job?: Job;
  onClose: () => void;
  onSaved: () => void;
};

export default function JobForm({ job, onClose, onSaved }: Props) {
  const [company, setCompany] = useState(job?.company ?? "");
  const [role, setRole] = useState(job?.role ?? "");
  const [status, setStatus] = useState<Status>(job?.status ?? "applied");
  const [link, setLink] = useState(job?.link ?? "");
  const [notes, setNotes] = useState(job?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const values = {
      company: company.trim(),
      role: role.trim(),
      status,
      link: link.trim() || null,
      notes: notes.trim() || null,
    };
    const { error } = job
      ? await supabase.from("jobs").update(values).eq("id", job.id)
      : await supabase.from("jobs").insert(values);
    setBusy(false);
    if (error) return setError(error.message);
    onSaved();
  }

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {job ? "Edit job" : "Add job"}
        </h2>
        <label className="block text-sm text-slate-700">
          Company
          <input required value={company} onChange={(e) => setCompany(e.target.value)} className={input} />
        </label>
        <label className="block text-sm text-slate-700">
          Role
          <input required value={role} onChange={(e) => setRole(e.target.value)} className={input} />
        </label>
        <label className="block text-sm text-slate-700">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={input}>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Job link
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className={input} placeholder="https://" />
        </label>
        <label className="block text-sm text-slate-700">
          Notes
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={input} />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button disabled={busy} className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
