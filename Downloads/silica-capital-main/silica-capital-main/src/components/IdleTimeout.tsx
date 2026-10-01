"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/adapters/supabase";

const IDLE_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
const WARN_BEFORE_MS = 60 * 1000; // warn for the last minute
const WRITE_THROTTLE_MS = 5_000; // don't hammer localStorage on every mousemove
const TICK_MS = 2_000;

/** Shared across tabs on purpose — working in one tab keeps the others alive. */
const LAST_ACTIVITY_KEY = "silica-capital:last-activity";
/** Read once by the sign-in screen so we can say *why* they were signed out. */
export const IDLE_LOGOUT_FLAG = "silica-capital:idle-logout";

/** Genuine interaction only. Deliberately excludes focus/visibility: coming back
 *  to a tab left open for hours is not activity, and must still log out. */
const ACTIVITY_EVENTS = ["mousemove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

function readLastActivity(): number {
  const raw = window.localStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

/**
 * Signs the user out after 20 minutes without interaction.
 *
 * This calls Supabase's signOut, which revokes the refresh token server-side —
 * it is a real logout, not just a UI lock. Note the limit is enforced in the
 * browser, so it protects an unattended screen (the actual risk here); it is
 * not a defence against someone who has already extracted a valid token.
 */
export function IdleTimeout() {
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const lastWrite = useRef(0);
  const signingOut = useRef(false);

  const markActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastWrite.current < WRITE_THROTTLE_MS) return;
    lastWrite.current = now;
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    setMsLeft(null);
  }, []);

  const signOutNow = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    window.localStorage.setItem(IDLE_LOGOUT_FLAG, "1");
    window.localStorage.removeItem(LAST_ACTIVITY_KEY);
    await getSupabase()?.auth.signOut();
  }, []);

  /** Pressing "Stay signed in" must reset the clock even inside the throttle window. */
  const staySignedIn = useCallback(() => {
    const now = Date.now();
    lastWrite.current = now;
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    setMsLeft(null);
  }, []);

  useEffect(() => {
    // Seed the clock on mount so a fresh login starts with a full 20 minutes.
    if (!window.localStorage.getItem(LAST_ACTIVITY_KEY)) {
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActivity, { passive: true });
    }

    const check = () => {
      const idleFor = Date.now() - readLastActivity();
      const remaining = IDLE_LIMIT_MS - idleFor;

      if (remaining <= 0) {
        void signOutNow();
        return;
      }
      // Covers the closed-laptop case too: on return, the elapsed time is read
      // from storage rather than from a timer that was suspended.
      setMsLeft(remaining <= WARN_BEFORE_MS ? remaining : null);
    };

    check();
    const timer = window.setInterval(check, TICK_MS);
    document.addEventListener("visibilitychange", check);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActivity);
      }
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [markActivity, signOutNow]);

  if (msLeft === null) return null;

  const seconds = Math.max(0, Math.ceil(msLeft / 1000));

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4"
    >
      <div className="panel flex w-full max-w-md flex-col gap-3 border-gold/40 bg-panel2 px-5 py-4 shadow-lg sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gold">Still there?</p>
          <p className="mt-0.5 text-xs text-muted">
            You'll be signed out in {seconds} second{seconds === 1 ? "" : "s"} for
            security. Anything you've typed but not saved will be lost.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="btn-ghost" onClick={() => void signOutNow()}>
            Sign out
          </button>
          <button className="btn-primary" onClick={staySignedIn} autoFocus>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
