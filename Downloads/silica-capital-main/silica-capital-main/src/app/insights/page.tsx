"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Stat, Empty } from "@/components/ui/Primitives";
import { BarList } from "@/components/charts/Bars";
import {
  money,
  num,
  pct,
  shortDate,
  signedMoney,
  signedPct,
  toneClass,
} from "@/lib/format";

export default function InsightsPage() {
  const { state, data } = useStore();
  const base = data.settings.baseCurrency;
  const closed = state.closedTrades;

  const stats = useMemo(() => {
    const wins = closed.filter((t) => t.realizedBase > 0);
    const losses = closed.filter((t) => t.realizedBase < 0);
    const grossWin = wins.reduce((s, t) => s + t.realizedBase, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.realizedBase, 0));
    const held = closed.filter((t) => t.holdingDays !== undefined);

    return {
      count: closed.length,
      winRate: closed.length ? wins.length / closed.length : 0,
      wins: wins.length,
      losses: losses.length,
      avgWin: wins.length ? grossWin / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      // Payoff ratio: how much the average winner makes vs the average loser loses.
      payoff: losses.length && wins.length ? grossWin / wins.length / (grossLoss / losses.length) : null,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
      avgHold: held.length
        ? held.reduce((s, t) => s + (t.holdingDays ?? 0), 0) / held.length
        : null,
      best: closed.reduce<(typeof closed)[number] | null>(
        (b, t) => (!b || t.realizedBase > b.realizedBase ? t : b),
        null,
      ),
      worst: closed.reduce<(typeof closed)[number] | null>(
        (w, t) => (!w || t.realizedBase < w.realizedBase ? t : w),
        null,
      ),
    };
  }, [closed]);

  /** Total P/L per symbol — realised plus what's still open. */
  const bySymbol = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of closed) map.set(t.symbol, (map.get(t.symbol) ?? 0) + t.realizedBase);
    for (const p of state.positions)
      map.set(p.symbol, (map.get(p.symbol) ?? 0) + p.unrealizedBase);
    return Array.from(map.entries())
      .map(([symbol, value]) => ({ symbol, value }))
      .sort((a, b) => b.value - a.value);
  }, [closed, state.positions]);

  const totalMarket = state.positions.reduce((s, p) => s + p.marketValueBase, 0);
  const biggest = state.positions[0];
  const concentration = totalMarket > 0 && biggest ? biggest.marketValueBase / totalMarket : 0;
  const cashDrag = state.navBase > 0 ? state.cashBase / state.navBase : 0;
  const feeDrag = state.contributedBase > 0 ? state.feesBase / state.contributedBase : 0;

  /** Plain-language read of the numbers, so the group doesn't have to interpret. */
  const readout: { tone: "good" | "warn" | "flat"; text: string }[] = [];

  if (state.totalProfitBase !== 0) {
    readout.push({
      tone: state.totalProfitBase > 0 ? "good" : "warn",
      text: `The pool is ${state.totalProfitBase > 0 ? "up" : "down"} ${money(
        Math.abs(state.totalProfitBase),
        base,
      )} on ${money(state.netInvestedBase, base)} of contributions. Measured properly — on unit price, ignoring new money — that's ${signedPct(
        state.twr,
      )} since ${shortDate(data.settings.inceptionDate)}.`,
    });
  }

  if (closed.length >= 3) {
    readout.push({
      tone: stats.winRate >= 0.5 ? "good" : "warn",
      text: `${stats.wins} of ${stats.count} closed trades made money (${pct(
        stats.winRate,
      )}).${
        stats.payoff
          ? ` The average winner is ${num(stats.payoff, 1)}x the average loser — ${
              stats.payoff >= 1.5
                ? "that's the healthy pattern: let winners run, cut losers early."
                : stats.payoff >= 1
                  ? "workable, but the winners aren't running far enough."
                  : "the losers are bigger than the winners, which is the pattern that quietly kills accounts."
            }`
          : ""
      }`,
    });
  }

  if (concentration > 0.4 && biggest) {
    readout.push({
      tone: "warn",
      text: `${biggest.symbol} is ${pct(concentration)} of everything invested. One bad earnings report there moves the whole group's money. Worth deciding as a group whether that's deliberate.`,
    });
  }

  if (cashDrag > 0.3) {
    readout.push({
      tone: "warn",
      text: `${pct(cashDrag)} of the fund is sitting in cash. That's fine if you're waiting for a setup, but it's money not working.`,
    });
  }

  if (state.realizedBase !== 0 && state.unrealizedBase !== 0) {
    readout.push({
      tone: "flat",
      text: `${signedMoney(state.realizedBase, base)} is locked in from sales; ${signedMoney(
        state.unrealizedBase,
        base,
      )} is still on paper and can change before you sell.`,
    });
  }

  if (state.feesBase > 0) {
    readout.push({
      tone: feeDrag > 0.02 ? "warn" : "flat",
      text: `${money(state.feesBase, base)} has gone to fees — ${pct(
        feeDrag,
        2,
      )} of everything contributed.${
        feeDrag > 0.02 ? " Worth trading less often, or in bigger clips." : ""
      }`,
    });
  }

  if (!data.trades.length && !closed.length && !state.positions.length) {
    return (
      <Panel>
        <Empty
          title="Nothing to analyse yet"
          hint="Record a few trades and this page will tell you what they add up to."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-muted">
          What the trades actually mean, in plain English.
        </p>
      </div>

      {readout.length > 0 && (
        <Panel>
          <PanelHeader title="The read" subtitle="Generated from your ledger" />
          <ul className="divide-y divide-line/70">
            {readout.map((r, i) => (
              <li key={i} className="flex gap-3 px-5 py-3.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    r.tone === "good"
                      ? "bg-pos"
                      : r.tone === "warn"
                        ? "bg-gold"
                        : "bg-faint"
                  }`}
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-muted">{r.text}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {closed.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Win rate"
              value={pct(stats.winRate)}
              sub={`${stats.wins} won · ${stats.losses} lost`}
            />
            <Stat
              label="Avg winner"
              value={money(stats.avgWin, base)}
              tone={stats.avgWin}
              sub={stats.payoff ? `${num(stats.payoff, 1)}x the average loser` : undefined}
            />
            <Stat
              label="Avg loser"
              value={money(-stats.avgLoss, base)}
              tone={-stats.avgLoss}
            />
            <Stat
              label="Avg hold"
              value={stats.avgHold !== null ? `${Math.round(stats.avgHold)} days` : "—"}
              sub={
                stats.profitFactor
                  ? `Profit factor ${num(stats.profitFactor, 2)}`
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.best && (
              <Panel>
                <div className="px-5 py-4">
                  <div className="label">Best closed trade</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-semibold">{stats.best.symbol}</span>
                    <span className="tnum text-sm text-pos">
                      {signedMoney(stats.best.realizedBase, base)}
                    </span>
                    <span className="tnum text-xs text-pos opacity-70">
                      {signedPct(stats.best.realizedPct)}
                    </span>
                  </div>
                  {stats.best.thesis && (
                    <p className="mt-2 text-xs text-muted">{stats.best.thesis}</p>
                  )}
                </div>
              </Panel>
            )}
            {stats.worst && (
              <Panel>
                <div className="px-5 py-4">
                  <div className="label">Worst closed trade</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-semibold">{stats.worst.symbol}</span>
                    <span className="tnum text-sm text-neg">
                      {signedMoney(stats.worst.realizedBase, base)}
                    </span>
                    <span className="tnum text-xs text-neg opacity-70">
                      {signedPct(stats.worst.realizedPct)}
                    </span>
                  </div>
                  {stats.worst.thesis && (
                    <p className="mt-2 text-xs text-muted">{stats.worst.thesis}</p>
                  )}
                </div>
              </Panel>
            )}
          </div>
        </>
      )}

      {bySymbol.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Making us money"
              subtitle="Realised plus unrealised, per stock"
            />
            <BarList
              items={bySymbol
                .filter((s) => s.value > 0)
                .map((s) => ({ label: s.symbol, value: s.value }))}
              format={(v) => signedMoney(v, base)}
              color="#199e70"
            />
            {!bySymbol.some((s) => s.value > 0) && (
              <Empty title="Nothing in profit yet." />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Costing us money" subtitle="Same basis" />
            <BarList
              items={bySymbol
                .filter((s) => s.value < 0)
                // Biggest loss first, so the row order matches the bar lengths.
                .sort((a, b) => a.value - b.value)
                .map((s) => ({ label: s.symbol, value: s.value }))}
              format={(v) => signedMoney(v, base)}
              color="#e66767"
            />
            {!bySymbol.some((s) => s.value < 0) && (
              <Empty title="Nothing underwater. Enjoy it." />
            )}
          </Panel>
        </div>
      )}

      {closed.length > 0 && (
        <Panel>
          <PanelHeader title="Closed trades" subtitle="Every position we've exited" />
          <div className="table-wrap">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th">Stock</th>
                  <th className="th">Opened</th>
                  <th className="th">Closed</th>
                  <th className="th text-right">Held</th>
                  <th className="th text-right">Cost</th>
                  <th className="th text-right">Proceeds</th>
                  <th className="th text-right">Result</th>
                </tr>
              </thead>
              <tbody>
                {closed.map((t, i) => (
                  <tr key={`${t.symbol}-${t.closedOn}-${i}`} className="row">
                    <td className="td font-medium">{t.symbol}</td>
                    <td className="td text-muted">
                      {t.openedOn ? shortDate(t.openedOn) : "—"}
                    </td>
                    <td className="td text-muted">{shortDate(t.closedOn)}</td>
                    <td className="td tnum text-right text-muted">
                      {t.holdingDays !== undefined ? `${t.holdingDays}d` : "—"}
                    </td>
                    <td className="td tnum text-right text-muted">
                      {money(t.costNative, t.currency)}
                    </td>
                    <td className="td tnum text-right text-muted">
                      {money(t.proceedsNative, t.currency)}
                    </td>
                    <td className={`td tnum text-right ${toneClass(t.realizedBase)}`}>
                      <div>{signedMoney(t.realizedBase, base)}</div>
                      <div className="text-[11px] opacity-70">{signedPct(t.realizedPct)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
