import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "missing-key"
);

export const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

export const STATUSES: { key: Status; label: string; dot: string }[] = [
  { key: "wishlist", label: "Wishlist", dot: "bg-slate-400" },
  { key: "applied", label: "Applied", dot: "bg-blue-500" },
  { key: "interview", label: "Interview", dot: "bg-amber-500" },
  { key: "offer", label: "Offer", dot: "bg-emerald-500" },
  { key: "rejected", label: "Rejected", dot: "bg-rose-500" },
];
