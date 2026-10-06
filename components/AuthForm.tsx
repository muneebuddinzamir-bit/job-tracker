"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
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

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-24 w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-slate-900">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <label className="block text-sm text-slate-700">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
  );
}
