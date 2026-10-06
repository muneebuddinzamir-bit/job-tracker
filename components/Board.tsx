"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, STATUSES, type Job, type Status } from "@/lib/supabase";
import JobForm from "./JobForm";

export default function Board({ email }: { email: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Job | "new" | null>(null);

  const load = useCallback(() => {
    return supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setJobs(data as Job[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function move(job: Job, status: Status) {
    setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, status } : j)));
    const { error } = await supabase.from("jobs").update({ status }).eq("id", job.id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  async function remove(job: Job) {
    if (!confirm(`Delete ${job.role} at ${job.company}?`)) return;
    setJobs((js) => js.filter((j) => j.id !== job.id));
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
          <p className="text-sm text-slate-500">{email} · {jobs.length} jobs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing("new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            + Add job
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}
      {loading && <p className="text-slate-500">Loading…</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATUSES.map((col) => {
          const items = jobs.filter((j) => j.status === col.key);
          return (
            <section key={col.key} className="rounded-xl bg-slate-100 p-3">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.label}
                <span className="ml-auto text-slate-400">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((job) => (
                  <article key={job.id} className="rounded-lg bg-white p-3 shadow-sm">
                    <h3 className="font-medium text-slate-900">{job.role}</h3>
                    <p className="text-sm text-slate-600">{job.company}</p>
                    {job.notes && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{job.notes}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <select
                        aria-label="Move to status"
                        value={job.status}
                        onChange={(e) => move(job, e.target.value as Status)}
                        className="rounded border border-slate-300 px-1 py-0.5"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                      {job.link && (
                        <a href={job.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          Link
                        </a>
                      )}
                      <button onClick={() => setEditing(job)} className="ml-auto text-slate-500 hover:text-slate-900">
                        Edit
                      </button>
                      <button onClick={() => remove(job)} className="text-rose-500 hover:text-rose-700">
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {items.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">Nothing here yet</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <JobForm
          job={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
