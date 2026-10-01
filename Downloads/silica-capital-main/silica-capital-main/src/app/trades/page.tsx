"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Modal, Field, Empty } from "@/components/ui/Primitives";
import { money, num, shortDate } from "@/lib/format";
import { todayISO } from "@/lib/fund";
import type { Currency, Market, Side } from "@/lib/types";

export default function TradesPage() {
  // No delete here on purpose: the trade log is append-only, so the record of
  // what the group actually did can't be quietly rewritten after the fact.
  const { data, state, addTrade } = useStore();
  const base = data.settings.baseCurrency;

  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<Side>("BUY");
  const [date, setDate] = useState(todayISO());
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [market, setMarket] = useState<Market>("NGX");
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("");
  const [fxRate, setFxRate] = useState("");
  const [thesis, setThesis] = useState("");

  const sorted = useMemo(
    () => [...data.trades].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [data.trades],
  );

  /** Selling something we don't hold is almost always a typo — warn in the form. */
  const heldQty = useMemo(() => {
    const p = state.positions.find((x) => x.symbol === symbol.trim().toUpperCase());
    return p?.quantity ?? 0;
  }, [state.positions, symbol]);

  const reset = () => {
    setSide("BUY");
    setDate(todayISO());
    setSymbol("");
    setName("");
    setMarket("NGX");
    setCurrency("NGN");
    setQuantity("");
    setPrice("");
    setFees("");
    setFxRate("");
    setThesis("");
  };

  // Picking a market implies its currency — one less thing to get wrong.
  const onMarketChange = (m: Market) => {
    setMarket(m);
    if (m === "NGX") setCurrency("NGN");
    if (m === "US") setCurrency("USD");
  };

  const qtyNum = Number(quantity);
  const priceNum = Number(price);
  const feesNum = Number(fees || 0);
  const fxNum = currency === base ? 1 : Number(fxRate);
  const estimate =
    Number.isFinite(qtyNum) && Number.isFinite(priceNum) && qtyNum > 0 && priceNum > 0
      ? qtyNum * priceNum + (side === "BUY" ? feesNum : -feesNum)
      : null;

  const valid =
    symbol.trim().length > 0 &&
    qtyNum > 0 &&
    priceNum > 0 &&
    (currency === base || fxNum > 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addTrade({
      date,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || undefined,
      market,
      currency,
      side,
      quantity: qtyNum,
      price: priceNum,
      fees: Number.isFinite(feesNum) ? feesNum : 0,
      fxRate: fxNum,
      thesis: thesis.trim() || undefined,
    });
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Trades</h1>
          <p className="mt-1 text-sm text-muted">
            Every buy and sell. Write down why you took it — that's the part you'll
            want to read back in six months.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          Record trade
        </button>
      </div>

      <Panel>
        <PanelHeader title="Trade log" subtitle={`${data.trades.length} recorded`} />
        {sorted.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[940px]">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Side</th>
                  <th className="th">Stock</th>
                  <th className="th text-right">Qty</th>
                  <th className="th text-right">Price</th>
                  <th className="th text-right">Fees</th>
                  <th className="th text-right">Total ({base})</th>
                  <th className="th">Why</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => {
                  const gross = t.quantity * t.price;
                  const total =
                    (t.side === "BUY" ? gross + t.fees : gross - t.fees) *
                    (t.currency === base ? 1 : t.fxRate);
                  return (
                    <tr key={t.id} className="row align-top">
                      <td className="td whitespace-nowrap text-muted">{shortDate(t.date)}</td>
                      <td className="td">
                        <span
                          className={`chip ${
                            t.side === "BUY"
                              ? "border-brand/30 text-brand"
                              : "border-gold/30 text-gold"
                          }`}
                        >
                          {t.side}
                        </span>
                      </td>
                      <td className="td">
                        <div className="font-medium">{t.symbol}</div>
                        <div className="text-[11px] text-faint">{t.market}</div>
                      </td>
                      <td className="td tnum text-right">{num(t.quantity, 0)}</td>
                      <td className="td tnum text-right">
                        {money(t.price, t.currency, 2)}
                        {t.currency !== base && (
                          <div className="text-[11px] text-faint">@ {num(t.fxRate, 0)}</div>
                        )}
                      </td>
                      <td className="td tnum text-right text-muted">
                        {t.fees ? money(t.fees, t.currency) : "—"}
                      </td>
                      <td className="td tnum text-right font-medium">{money(total, base)}</td>
                      <td className="td max-w-[280px] text-xs text-muted">
                        {t.thesis ?? <span className="text-faint">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No trades yet"
            hint="Record the first buy and the portfolio will start tracking itself."
          />
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Record trade" wide>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-2">
            {(["BUY", "SELL"] as Side[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  side === s
                    ? "border-brand/50 bg-brand/10 text-brand"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {s === "BUY" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <input
                className="field"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Market">
              <select
                className="field"
                value={market}
                onChange={(e) => onMarketChange(e.target.value as Market)}
              >
                <option value="NGX">NGX — Nigerian Exchange</option>
                <option value="US">US — NYSE / Nasdaq</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ticker">
              <input
                className="field uppercase"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="GTCO"
              />
            </Field>
            <Field label="Company name" hint="Optional.">
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Guaranty Trust Holding"
              />
            </Field>
          </div>

          {side === "SELL" && symbol.trim() && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs ${
                heldQty > 0
                  ? "border-line bg-panel2 text-muted"
                  : "border-gold/30 bg-gold/10 text-gold"
              }`}
            >
              {heldQty > 0
                ? `Currently holding ${num(heldQty, 0)} shares of ${symbol.trim().toUpperCase()}.`
                : `You don't currently hold ${symbol.trim().toUpperCase()} — check the ticker.`}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Quantity">
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>
            <Field label={`Price per share (${currency})`}>
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field label={`Fees (${currency})`} hint="Commission, stamp duty, SEC.">
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          {currency !== base && (
            <Field
              label={`Exchange rate (1 ${currency} = ? ${base})`}
              hint="The rate you actually got on the day."
            >
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={fxRate}
                onChange={(e) => setFxRate(e.target.value)}
                placeholder="1600"
              />
            </Field>
          )}

          <Field
            label="Why this trade"
            hint="One line is enough. It's what makes the Insights page useful later."
          >
            <textarea
              className="field min-h-[70px] resize-y"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Cheap on book value, recapitalisation tailwind."
            />
          </Field>

          {estimate !== null && (
            <div className="rounded-lg border border-line bg-panel2 px-3 py-2.5 text-sm">
              <span className="text-muted">
                {side === "BUY" ? "Total cost" : "Net proceeds"}:{" "}
              </span>
              <span className="tnum font-medium">{money(estimate, currency)}</span>
              {currency !== base && fxNum > 0 && (
                <span className="tnum ml-2 text-muted">
                  ≈ {money(estimate * fxNum, base)}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!valid}>
              Save trade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
