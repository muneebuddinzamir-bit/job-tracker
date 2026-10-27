// Pure helpers for job data. No React or Supabase here, so they are easy to unit test.

export type Status = "wishlist" | "applied" | "interview" | "offer" | "rejected";

export type Job = {
  id: string;
  company: string;
  role: string;
  status: Status;
  link: string | null;
  notes: string | null;
  created_at: string;
};

export type JobInput = Pick<Job, "company" | "role" | "status" | "link" | "notes">;

export const STATUSES: { key: Status; label: string; dot: string }[] = [
  { key: "wishlist", label: "Wishlist", dot: "bg-slate-400" },
  { key: "applied", label: "Applied", dot: "bg-blue-500" },
  { key: "interview", label: "Interview", dot: "bg-amber-500" },
  { key: "offer", label: "Offer", dot: "bg-emerald-500" },
  { key: "rejected", label: "Rejected", dot: "bg-rose-500" },
];

export type Stats = {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  /** Share of sent applications that got an interview or offer, 0–100. */
  responseRate: number;
};

export function computeStats(jobs: Job[]): Stats {
  const count = (s: Status) => jobs.filter((j) => j.status === s).length;
  const interviews = count("interview");
  const offers = count("offer");
  // Wishlist items were never sent, so they don't count towards the response rate.
  const sent = jobs.length - count("wishlist");
  return {
    total: jobs.length,
    active: count("applied") + interviews,
    interviews,
    offers,
    responseRate: sent === 0 ? 0 : Math.round(((interviews + offers) / sent) * 100),
  };
}

export function filterJobs(jobs: Job[], query: string): Job[] {
  const q = query.trim().toLowerCase();
  if (!q) return jobs;
  return jobs.filter((j) =>
    [j.company, j.role, j.notes ?? ""].some((field) => field.toLowerCase().includes(q))
  );
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(jobs: Job[]): string {
  const header = ["Company", "Role", "Status", "Link", "Notes", "Added"];
  const rows = jobs.map((j) =>
    [j.company, j.role, j.status, j.link ?? "", j.notes ?? "", j.created_at.slice(0, 10)].map(csvCell)
  );
  return [header, ...rows].map((r) => r.join(",")).join("\n");
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
