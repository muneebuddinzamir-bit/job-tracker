"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/lib/supabase";
import { demoStore, supabaseStore } from "@/lib/store";
import AuthForm from "./AuthForm";
import Board from "./Board";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isConfigured);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    // `?demo` in the URL opens the demo straight away, so it can be linked from a CV or portfolio.
    // The URL is only readable in the browser, so this has to run after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).has("demo")) setDemo(true);
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  function exitDemo() {
    setDemo(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (!ready) return <p className="p-8 text-slate-500">Loading…</p>;

  if (demo) return <Board store={demoStore} subtitle="Demo mode" demo onExit={exitDemo} />;

  if (session)
    return (
      <Board
        store={supabaseStore}
        subtitle={session.user.email ?? ""}
        onExit={() => supabase.auth.signOut()}
      />
    );

  return <AuthForm onDemo={() => setDemo(true)} canSignIn={isConfigured} />;
}
