"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  onDemo: () => void;
  canSignIn: boolean;
};

const FEATURES = [
  "Kanban board from Wishlist to Offer, with drag and drop",
  "Response-rate stats, search and CSV export",
  "Your data is private: Postgres row-level security",
];

export default function AuthForm({ onDemo, canSignIn }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMessage(error.message);
    else if (mode === "signup" && !data.session)
      setMessage("Check your email to confirm your account, then log in.");
  }

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Job Tracker</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-900">
          Keep every job application in one place.
        </h1>
        <p className="mt-4 text-slate-600">
          Track where you applied, what happened next and how your search is going.
        </p>
        <ul className="mt-6 space-y-2 text-slate-700">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-indigo-600">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onDemo}
          className="mt-8 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          Try the demo, no signup →
        </button>
        <p className="mt-2 text-xs text-slate-500">Sample data, saved only in your browser.</p>
      </section>

      {canSignIn && (
        <form
          onSubmit={submit}
          className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "login" ? "Log in to your board" : "Create your account"}
          </h2>
          <label className="block text-sm text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <label className="block text-sm text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </label>
          {message && <p className="text-sm text-rose-600">{message}</p>}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-sm text-slate-600 hover:underline"
          >
            {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
          </button>
        </form>
      )}
    </div>
  );
}
