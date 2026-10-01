"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/adapters/supabase";
import { IdleTimeout, IDLE_LOGOUT_FLAG } from "./IdleTimeout";

/**
 * In local mode this is a pass-through. In shared mode it blocks the app until
 * a Supabase user signs in — which matters, because the row-level security
 * policies in schema.sql only grant access to the `authenticated` role. Without
 * this gate every query would come back empty and look like data loss.
 *
 * Accounts are created by the admin in the Supabase dashboard, not here: an
 * open sign-up form on a fund ledger would let anyone with the URL in.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  /** null = not checked yet. Distinguishes "not on the member list" from "no data". */
  const [approved, setApproved] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Set by IdleTimeout so we can explain the sign-out instead of just dumping
   *  them back at a login box with no idea what happened. */
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(IDLE_LOGOUT_FLAG)) {
      setTimedOut(true);
      window.localStorage.removeItem(IDLE_LOGOUT_FLAG);
    }
  }, [session]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setChecking(false);
      return;
    }
    const sb = getSupabase()!;
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setApproved(next ? null : false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Ask the database whether this signed-in user is on the allow-list. Row-level
  // security already blocks unapproved users; this only exists so we can say so
  // plainly instead of showing them an empty ledger.
  useEffect(() => {
    if (!supabaseConfigured || !session) return;
    let cancelled = false;
    getSupabase()!
      .rpc("sc_is_member")
      .then(({ data, error: err }) => {
        if (cancelled) return;
        // Fail closed: if the check itself errors, treat it as no access.
        if (err) {
          setError(err.message);
          setApproved(false);
        } else {
          setApproved(data === true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!supabaseConfigured) return <>{children}</>;

  if (checking) {
    return <div className="py-24 text-center text-sm text-faint">Checking your session…</div>;
  }

  if (session && approved === null) {
    return <div className="py-24 text-center text-sm text-faint">Checking your access…</div>;
  }

  if (session && approved === false) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="panel px-5 py-6 text-center">
          <h1 className="text-base font-semibold">You're signed in, but not on the member list</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This account ({session.user.email}) isn't approved for Silica Capital,
            so there's nothing to show you. If you should have access, ask one of
            the group to add you.
          </p>
          <button
            className="btn-ghost mt-5"
            onClick={() => getSupabase()?.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (session && approved) {
    return (
      <>
        {children}
        <IdleTimeout />
      </>
    );
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const sb = getSupabase()!;
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-brand/30 bg-brand/10 font-bold text-brand">
          S
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Silica Capital</h1>
          <p className="text-xs text-muted">Members only</p>
        </div>
      </div>

      {timedOut && (
        <div className="mb-4 rounded-lg border border-gold/30 bg-gold/[0.08] px-4 py-3 text-xs text-gold">
          You were signed out after 20 minutes of inactivity. Sign in again to
          carry on.
        </div>
      )}

      <form onSubmit={signIn} className="panel space-y-4 px-5 py-5">
        <label className="block">
          <span className="label">Email</span>
          <input
            className="field mt-1.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input
            className="field mt-1.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="rounded-lg border border-neg/30 bg-neg/10 px-3 py-2 text-xs text-neg">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="border-t border-line pt-3 text-[11px] leading-relaxed text-faint">
          Silica Capital is invite-only. There's no sign-up — accounts are
          created by the group. If you'd like to join, or you've lost your
          password, speak to one of us and we'll sort it out.
        </p>
      </form>
    </div>
  );
}

export function SignOutButton() {
  if (!supabaseConfigured) return null;
  return (
    <button
      className="text-xs text-faint transition hover:text-ink"
      onClick={() => getSupabase()?.auth.signOut()}
    >
      Sign out
    </button>
  );
}
