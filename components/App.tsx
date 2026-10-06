"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/lib/supabase";
import AuthForm from "./AuthForm";
import Board from "./Board";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isConfigured)
    return (
      <p className="mx-auto mt-24 max-w-md rounded-xl bg-amber-50 p-4 text-amber-900">
        Supabase is not configured. Copy <code>.env.example</code> to{" "}
        <code>.env.local</code> and add your project URL and anon key.
      </p>
    );
  if (!ready) return <p className="p-8 text-slate-500">Loading…</p>;
  return session ? <Board email={session.user.email ?? ""} /> : <AuthForm />;
}
