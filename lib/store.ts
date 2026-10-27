import { supabase } from "./supabase";
import type { Job, JobInput } from "./jobs";

/** Where jobs are read from and written to. The board doesn't care which one it gets. */
export type JobStore = {
  list(): Promise<Job[]>;
  create(values: JobInput): Promise<void>;
  update(id: string, values: Partial<JobInput>): Promise<void>;
  remove(id: string): Promise<void>;
};

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/** Real data, protected by row-level security in Supabase. */
export const supabaseStore: JobStore = {
  async list() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    check(error);
    return data as Job[];
  },
  async create(values) {
    check((await supabase.from("jobs").insert(values)).error);
  },
  async update(id, values) {
    check((await supabase.from("jobs").update(values).eq("id", id)).error);
  },
  async remove(id) {
    check((await supabase.from("jobs").delete().eq("id", id)).error);
  },
};

const DEMO_KEY = "job-tracker-demo";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export function sampleJobs(): Job[] {
  const job = (
    id: string,
    company: string,
    role: string,
    status: Job["status"],
    age: number,
    notes: string | null = null
  ): Job => ({ id, company, role, status, link: null, notes, created_at: daysAgo(age) });

  return [
    job("d1", "Northwind Labs", "Junior Frontend Developer", "wishlist", 1, "Referral from a friend, apply this week"),
    job("d2", "Brightpath", "React Developer Intern", "wishlist", 2),
    job("d3", "Cobalt Systems", "Junior Full Stack Developer", "applied", 3, "Applied by email with CV and live demo link"),
    job("d4", "Pixelcraft Studio", "Next.js Developer", "applied", 6, "Remote, 10am–7pm"),
    job("d5", "Greenline Tech", "Software Engineer (Fresh)", "applied", 9),
    job("d6", "Orbit Digital", "Frontend Engineer", "interview", 12, "Technical round on Friday: React hooks, REST APIs"),
    job("d7", "Lumen Apps", "Junior Web Developer", "interview", 15, "HR call done, task submitted"),
    job("d8", "Vertex Solutions", "Associate Software Engineer", "offer", 21, "Offer received, reviewing the contract"),
    job("d9", "Quantum Retail", "WordPress Developer", "rejected", 25, "Wanted 2+ years of PHP"),
    job("d10", "Harbor Health", "UI Developer", "rejected", 30),
  ];
}

function save(jobs: Job[]) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(jobs));
  } catch {
    // Private mode or full storage: the demo still works for this page view.
  }
}

function load(): Job[] {
  try {
    const saved = localStorage.getItem(DEMO_KEY);
    if (saved) return JSON.parse(saved) as Job[];
  } catch {
    // Blocked or corrupted storage: start again from the sample data.
  }
  const jobs = sampleJobs();
  save(jobs);
  return jobs;
}

/** Demo mode: data lives only in this browser, so visitors can try the app without an account. */
export const demoStore: JobStore = {
  async list() {
    return load();
  },
  async create(values) {
    save([{ ...values, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...load()]);
  },
  async update(id, values) {
    save(load().map((j) => (j.id === id ? { ...j, ...values } : j)));
  },
  async remove(id) {
    save(load().filter((j) => j.id !== id));
  },
};

export function resetDemo() {
  try {
    localStorage.removeItem(DEMO_KEY);
  } catch {
    // Nothing to reset.
  }
}
