"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { moneyCompact, signedPct } from "@/lib/format";
import { SignOutButton } from "./AuthGate";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/contributions", label: "Contributions" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/trades", label: "Trades" },
  { href: "/months", label: "Months" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Settings" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, data, ready, error, mode, isDemo } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const base = data.settings.baseCurrency;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-brand/30 bg-brand/10 text-sm font-bold text-brand">
              S
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              {data.settings.fundName}
            </span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-panel2 font-medium text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {ready && (
              <div className="hidden text-right sm:block">
                <div className="tnum text-sm font-semibold">
                  {moneyCompact(state.navBase, base)}
                </div>
                <div
                  className={`tnum text-[11px] ${
                    state.totalProfitBase >= 0 ? "text-pos" : "text-neg"
                  }`}
                >
                  {signedPct(state.totalProfitPct)} all time
                </div>
              </div>
            )}
            <button
              className="rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="grid grid-cols-2 gap-1 border-t border-line px-4 py-3 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-panel2 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {error && (
          <div className="mb-5 rounded-lg border border-neg/30 bg-neg/10 px-4 py-3 text-sm text-neg">
            {error}
          </div>
        )}

        {isDemo && (
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-gold/25 bg-gold/[0.07] px-4 py-3 text-sm">
            <span className="font-medium text-gold">Demo data</span>
            <span className="text-muted">
              These are made-up numbers so you can see how it works. Nothing here is real.
            </span>
            <Link href="/settings" className="font-medium text-gold underline underline-offset-2">
              Clear it and start fresh →
            </Link>
          </div>
        )}

        {mode === "local" && !isDemo && (
          <div className="mb-5 rounded-lg border border-line bg-panel px-4 py-3 text-xs text-muted">
            Saving to this browser only. To let everyone in the group see the same
            numbers, connect Supabase — see{" "}
            <Link href="/settings" className="text-brand underline underline-offset-2">
              Settings
            </Link>
            .
          </div>
        )}

        {!ready ? (
          <div className="py-24 text-center text-sm text-faint">Loading the ledger…</div>
        ) : (
          children
        )}
      </main>

      <footer className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-10 pt-4 text-xs text-faint sm:px-6">
        <span>
          {data.settings.fundName} · unitised fund ledger · values in{" "}
          {base === "NGN" ? "naira" : "dollars"}
        </span>
        <SignOutButton />
      </footer>
    </div>
  );
}
