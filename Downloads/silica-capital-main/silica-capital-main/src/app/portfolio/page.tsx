"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Modal, Field, Empty, Stat } from "@/components/ui/Primitives";
import {
  money,
  num,
  pct,
  relativeAge,
  shortDate,
  signedMoney,
  signedPct,
  toneClass,
} from "@/lib/format";
import { todayISO } from "@/lib/fund";

export default function PortfolioPage() {
  const { state, data, setPrice, setFx } = useStore();
  const base = data.settings.baseCurrency;

  const [open, setOpen] = useState(false);
  const [asOf, setAsOf] = useState(todayISO());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [fxDraft, setFxDraft] = useState("");

  const holdsUsd = state.positions.some((p) => p.currency === "USD");
  const latestFx = useMemo(
    () => [...data.fxMarks].filter((f) => f.currency === "USD").sort((a, b) => (a.date < b.date ? 1 : -1))[0],
    [data.fxMarks],
  );

  const openUpdater = () => {
    setAsOf(todayISO());
    setDraft(
      Object.fromEntries(state.positions.map((p) => [p.symbol, String(p.lastPriceNative)])),
    );
    setFxDraft(latestFx ? String(latestFx.rate) : "");
    setOpen(true);
  };

  const savePrices = (e: React.FormEvent) => {
    e.preventDefault();
    for (const position of state.positions) {
      const raw = draft[position.symbol];
      const value = Number(raw);
      if (!raw || !Number.isFinite(value) || value <= 0) continue;
      setPrice({
        symbol: position.symbol,
        date: asOf,
        price: value,
        currency: position.currency,
      });
    }
    const rate = Number(fxDraft);
    if (holdsUsd && Number.isFinite(rate) && rate > 0) {
      setFx({ currency: "USD", date: asOf, rate });
    }
    setOpen(false);
  };

  const investedNow = state.positions.reduce((s, p) => s + p.costBase, 0);
  const marketNow = state.positions.reduce((s, p) => s + p.marketValueBase, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">
            What we hold right now, at the last prices you entered.
          </p>
        </div>
        <button className="btn-primary" onClick={openUpdater} disabled={!state.positions.length}>
          Update prices
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Market value" value={money(marketNow, base)} />
        <Stat label="Cost of what we hold" value={money(investedNow, base)} />
        <Stat
          label="Unrealised P/L"
          value={signedMoney(state.unrealizedBase, base)}
          tone={state.unrealizedBase}
          sub={investedNow > 0 ? signedPct(state.unrealizedBase / investedNow) : undefined}
        />
        <Stat
          label="Cash available"
          value={money(state.cashBase, base)}
          sub={
            state.cash.USD
              ? `${money(state.cash.NGN, "NGN")} + ${money(state.cash.USD, "USD")}`
              : "Not yet invested"
          }
        />
      </div>

      <Panel>
        <PanelHeader
          title="Holdings"
          subtitle="Average cost basis — partial sells draw down the average, not specific lots"
        />
        {state.positions.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="th">Stock</th>
                  <th className="th text-right">Qty</th>
                  <th className="th text-right">Avg cost</th>
                  <th className="th text-right">Last price</th>
                  <th className="th text-right">Value ({base})</th>
                  <th className="th text-right">Unrealised</th>
                  <th className="th text-right">Weight</th>
                </tr>
              </thead>
              <tbody>
                {state.positions.map((p) => (
                  <tr key={p.symbol} className="row">
                    <td className="td">
                      <div className="font-medium">{p.symbol}</div>
                      <div className="text-[11px] text-faint">
                        {p.name ? `${p.name} · ` : ""}
                        {p.market}
                      </div>
                    </td>
                    <td className="td tnum text-right">{num(p.quantity, 0)}</td>
                    <td className="td tnum text-right text-muted">
                      {money(p.avgCostNative, p.currency, 2)}
                    </td>
                    <td className="td tnum text-right">
                      {money(p.lastPriceNative, p.currency, 2)}
                      <div className="text-[11px] text-faint">
                        {p.priceIsStale ? (
                          <span className="text-gold">never updated</span>
                        ) : p.lastPriceDate ? (
                          relativeAge(p.lastPriceDate)
                        ) : null}
                      </div>
                    </td>
                    <td className="td tnum text-right font-medium">
                      {money(p.marketValueBase, base)}
                    </td>
                    <td className={`td tnum text-right ${toneClass(p.unrealizedBase)}`}>
                      <div>{signedMoney(p.unrealizedBase, base)}</div>
                      <div className="text-[11px] opacity-70">{signedPct(p.unrealizedPct)}</div>
                      {p.currency !== base && (
                        // Worth splitting out: a holding can be down in dollars
                        // and still up in naira, purely on the exchange rate.
                        <div className="text-[11px] text-faint">
                          share {signedPct(p.unrealizedPctNative)} · fx{" "}
                          {signedPct(p.unrealizedPct - p.unrealizedPctNative)}
                        </div>
                      )}
                    </td>
                    <td className="td tnum text-right text-muted">
                      {pct(marketNow > 0 ? p.marketValueBase / marketNow : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No open positions"
            hint="Once you record a buy on the Trades page, it shows up here."
          />
        )}
      </Panel>

      {state.positions.some((p) => p.priceIsStale) && (
        <Panel className="border-gold/25 bg-gold/[0.05]">
          <div className="px-5 py-4 text-xs text-muted">
            <span className="font-medium text-gold">Heads up:</span> anything marked
            "never updated" is being valued at what we paid for it, so the profit
            figures understate reality in both directions. Hit{" "}
            <span className="text-ink">Update prices</span> to fix it.
          </div>
        </Panel>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Update prices" wide>
        <form onSubmit={savePrices} className="space-y-5">
          <Field
            label="Prices as of"
            hint="Use the date the prices are from — back-dating keeps the history curve honest."
          >
            <input
              className="field"
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </Field>

          <div className="space-y-3">
            {state.positions.map((p) => (
              <div key={p.symbol} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <div className="text-sm font-medium">{p.symbol}</div>
                  <div className="text-[11px] text-faint">{p.currency}</div>
                </div>
                <input
                  className="field tnum flex-1"
                  type="number"
                  step="any"
                  min="0"
                  value={draft[p.symbol] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [p.symbol]: e.target.value }))}
                />
                <div className="w-28 shrink-0 text-right text-xs text-faint">
                  was {money(p.lastPriceNative, p.currency, 2)}
                </div>
              </div>
            ))}
          </div>

          {holdsUsd && (
            <Field
              label="USD → NGN rate"
              hint="Needed to value the US holdings in naira."
            >
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={fxDraft}
                onChange={(e) => setFxDraft(e.target.value)}
                placeholder="1600"
              />
            </Field>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save prices
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
