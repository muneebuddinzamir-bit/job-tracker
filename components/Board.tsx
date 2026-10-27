"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUSES, computeStats, filterJobs, timeAgo, toCsv, type Job, type Status } from "@/lib/jobs";
import { resetDemo, type JobStore } from "@/lib/store";
import JobForm from "./JobForm";

type Props = {
  store: JobStore;
  subtitle: string;
  demo?: boolean;
  onExit: () => void;
};

export default function Board({ store, subtitle, demo = false, onExit }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Job | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Status | null>(null);

  const load = useCallback(() => {
    return store
      .list()
      .then(setJobs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [store]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => computeStats(jobs), [jobs]);
  const visible = useMemo(() => filterJobs(jobs, query), [jobs, query]);

  async function run(change: () => Promise<void>) {
    try {
      await change();
    } catch (err) {
      setError((err as Error).message);
      load();
    }
  }

  function move(job: Job, status: Status) {
    if (job.status === status) return;
    setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, status } : j)));
    run(() => store.update(job.id, { status }));
  }

  function remove(job: Job) {
    if (!confirm(`Delete ${job.role} at ${job.company}?`)) return;
    setJobs((js) => js.filter((j) => j.id !== job.id));
    run(() => store.remove(job.id));
  }

  function exportCsv() {
    const url = URL.createObjectURL(new Blob([toCsv(jobs)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function drop(status: Status) {
    const job = jobs.find((j) => j.id === dragging);
    if (job) move(job, status);
    setDragging(null);
    setDropTarget(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {demo && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span>
            <strong>Demo mode:</strong> sample data, saved only in this browser. Drag cards between columns to try it.
          </span>
          <button
            onClick={() => {
              resetDemo();
              setLoading(true);
              load();
            }}
            className="ml-auto font-medium underline-offset-2 hover:underline"
          >
            Reset sample data
          </button>
        </div>
      )}

      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing("new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            + Add job
          </button>
          <button
            onClick={exportCsv}
            disabled={jobs.length === 0}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={onExit}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            {demo ? "Exit demo" : "Log out"}
          </button>
        </div>
      </header>

      <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Applications", stats.total],
          ["In progress", stats.active],
          ["Interviews", stats.interviews],
          ["Offers", stats.offers],
          ["Response rate", `${stats.responseRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search company, role or notes…"
        aria-label="Search jobs"
        className="mb-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:max-w-sm"
      />

      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}

      {!loading && jobs.length === 0 && (
        <p className="mb-5 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No applications yet. Click <strong>+ Add job</strong> to add your first one.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATUSES.map((col) => {
          const items = visible.filter((j) => j.status === col.key);
          return (
            <section
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(col.key);
              }}
              onDragLeave={() => setDropTarget((t) => (t === col.key ? null : t))}
              onDrop={() => drop(col.key)}
              className={`rounded-xl p-3 transition ${
                dropTarget === col.key ? "bg-indigo-100 ring-2 ring-indigo-300" : "bg-slate-100"
              }`}
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.label}
                <span className="ml-auto text-slate-400">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((job) => (
                  <article
                    key={job.id}
                    draggable
                    onDragStart={() => setDragging(job.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setDropTarget(null);
                    }}
                    className={`cursor-grab rounded-lg bg-white p-3 shadow-sm active:cursor-grabbing ${
                      dragging === job.id ? "opacity-50" : ""
                    }`}
                  >
                    <h3 className="font-medium text-slate-900">{job.role}</h3>
                    <p className="text-sm text-slate-600">{job.company}</p>
                    {job.notes && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{job.notes}</p>}
                    <p className="mt-1 text-xs text-slate-400">Added {timeAgo(job.created_at)}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <select
                        aria-label={`Move ${job.role} at ${job.company}`}
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
                  <p className="py-4 text-center text-xs text-slate-400">
                    {query ? "No matches" : "Drop a card here"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <JobForm
          store={store}
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
