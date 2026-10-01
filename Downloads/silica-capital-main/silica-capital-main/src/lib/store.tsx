"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Contribution,
  FundData,
  FundState,
  FxMark,
  Member,
  PriceMark,
  Settings,
  Trade,
  Withdrawal,
} from "./types";
import { computeFund } from "./fund";
import { localAdapter } from "./adapters/local";
import { supabaseAdapter, supabaseConfigured } from "./adapters/supabase";
import type { Adapter } from "./adapters/types";
import { EMPTY, SEED } from "./seed";
import { uid } from "./format";

const adapter: Adapter = supabaseConfigured ? supabaseAdapter : localAdapter;

interface StoreValue {
  data: FundData;
  state: FundState;
  ready: boolean;
  error: string | null;
  mode: Adapter["kind"];
  /** True while the ledger is still the untouched demo dataset. */
  isDemo: boolean;

  addMember(input: Omit<Member, "id">): void;
  updateMember(id: string, patch: Partial<Member>): void;
  removeMember(id: string): void;

  addContribution(input: Omit<Contribution, "id">): void;
  removeContribution(id: string): void;

  addWithdrawal(input: Omit<Withdrawal, "id">): void;
  removeWithdrawal(id: string): void;

  addTrade(input: Omit<Trade, "id">): void;
  removeTrade(id: string): void;

  setPrice(input: Omit<PriceMark, "id">): void;
  removePriceMark(id: string): void;

  setFx(input: Omit<FxMark, "id">): void;

  updateSettings(patch: Partial<Settings>): void;

  replaceAll(data: FundData): void;
  resetToDemo(): void;
  clearAll(): void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FundData>(EMPTY);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    adapter
      .load()
      .then((loaded) => {
        if (!cancelled) setData(loaded);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after every mutation, but never on the initial load.
  useEffect(() => {
    if (!ready || !dirty.current) return;
    adapter.save(data).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : String(e));
    });
  }, [data, ready]);

  const mutate = useCallback((fn: (draft: FundData) => FundData) => {
    dirty.current = true;
    setError(null);
    setData((current) => fn(current));
  }, []);

  const state = useMemo(() => computeFund(data), [data]);

  const isDemo = useMemo(
    () => JSON.stringify(data) === JSON.stringify(SEED),
    [data],
  );

  const value: StoreValue = useMemo(
    () => ({
      data,
      state,
      ready,
      error,
      mode: adapter.kind,
      isDemo,

      addMember: (input) =>
        mutate((d) => ({ ...d, members: [...d.members, { ...input, id: uid("mem") }] })),
      updateMember: (id, patch) =>
        mutate((d) => ({
          ...d,
          members: d.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: (id) =>
        mutate((d) => ({
          ...d,
          members: d.members.filter((m) => m.id !== id),
          contributions: d.contributions.filter((c) => c.memberId !== id),
          withdrawals: d.withdrawals.filter((w) => w.memberId !== id),
        })),

      addContribution: (input) =>
        mutate((d) => ({
          ...d,
          contributions: [...d.contributions, { ...input, id: uid("con") }],
        })),
      removeContribution: (id) =>
        mutate((d) => ({ ...d, contributions: d.contributions.filter((c) => c.id !== id) })),

      addWithdrawal: (input) =>
        mutate((d) => ({
          ...d,
          withdrawals: [...d.withdrawals, { ...input, id: uid("wdr") }],
        })),
      removeWithdrawal: (id) =>
        mutate((d) => ({ ...d, withdrawals: d.withdrawals.filter((w) => w.id !== id) })),

      addTrade: (input) =>
        mutate((d) => ({
          ...d,
          trades: [...d.trades, { ...input, id: uid("trd"), symbol: input.symbol.toUpperCase() }],
        })),
      removeTrade: (id) =>
        mutate((d) => ({ ...d, trades: d.trades.filter((t) => t.id !== id) })),

      // One mark per symbol per day — re-marking the same day overwrites.
      setPrice: (input) =>
        mutate((d) => {
          const symbol = input.symbol.toUpperCase();
          const rest = d.priceMarks.filter(
            (p) => !(p.symbol.toUpperCase() === symbol && p.date === input.date),
          );
          return { ...d, priceMarks: [...rest, { ...input, symbol, id: uid("prc") }] };
        }),
      removePriceMark: (id) =>
        mutate((d) => ({ ...d, priceMarks: d.priceMarks.filter((p) => p.id !== id) })),

      setFx: (input) =>
        mutate((d) => {
          const rest = d.fxMarks.filter(
            (f) => !(f.currency === input.currency && f.date === input.date),
          );
          return { ...d, fxMarks: [...rest, { ...input, id: uid("fx") }] };
        }),

      updateSettings: (patch) =>
        mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } })),

      replaceAll: (next) => mutate(() => next),
      resetToDemo: () => mutate(() => JSON.parse(JSON.stringify(SEED))),
      clearAll: () =>
        mutate((d) => ({
          ...JSON.parse(JSON.stringify(EMPTY)),
          settings: { ...d.settings },
        })),
    }),
    [data, state, ready, error, isDemo, mutate],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
