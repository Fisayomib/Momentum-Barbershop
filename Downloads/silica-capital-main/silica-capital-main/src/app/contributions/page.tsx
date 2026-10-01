"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Modal, Field, Empty, Stat } from "@/components/ui/Primitives";
import { money, num, shortDate } from "@/lib/format";
import { monthLabel, todayISO } from "@/lib/fund";
import type { Currency } from "@/lib/types";

type Mode = "contribution" | "withdrawal";

export default function ContributionsPage() {
  // No delete here on purpose: money in and out is a permanent record, and
  // removing a contribution silently changes every other member's share.
  const { data, state, addContribution, addWithdrawal } = useStore();
  const base = data.settings.baseCurrency;

  const [mode, setMode] = useState<Mode>("contribution");
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(base);
  const [fxRate, setFxRate] = useState("");
  const [note, setNote] = useState("");

  const memberName = (id: string) =>
    data.members.find((m) => m.id === id)?.name ?? "Unknown";

  /** One combined, newest-first ledger of money in and money out. */
  const ledger = useMemo(() => {
    const rows = [
      ...data.contributions.map((c) => ({ kind: "in" as const, ...c })),
      ...data.withdrawals.map((w) => ({ kind: "out" as const, ...w })),
    ];
    return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [data.contributions, data.withdrawals]);

  /** Month-by-month totals — mirrors how the group actually runs the pot. */
  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data.contributions) {
      const key = c.date.slice(0, 7);
      const amt = c.amount * (c.currency === base ? 1 : c.fxRate || 1);
      map.set(key, (map.get(key) ?? 0) + amt);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [data.contributions, base]);

  const openFor = (m: Mode) => {
    setMode(m);
    setMemberId(data.members[0]?.id ?? "");
    setCurrency(base);
    setFxRate("");
    setAmount("");
    setNote("");
    setDate(todayISO());
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!memberId || !Number.isFinite(value) || value <= 0) return;
    const rate = currency === base ? 1 : Number(fxRate);
    if (currency !== base && (!Number.isFinite(rate) || rate <= 0)) return;

    const payload = {
      memberId,
      date,
      amount: value,
      currency,
      fxRate: rate,
      note: note.trim() || undefined,
    };
    if (mode === "contribution") addContribution(payload);
    else addWithdrawal(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Contributions</h1>
          <p className="mt-1 text-sm text-muted">
            Every naira in and out, and the units each payment bought.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => openFor("withdrawal")}>
            Record withdrawal
          </button>
          <button className="btn-primary" onClick={() => openFor("contribution")}>
            Record contribution
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total contributed" value={money(state.contributedBase, base)} />
        <Stat
          label="Total withdrawn"
          value={state.withdrawnBase ? money(state.withdrawnBase, base) : "—"}
        />
        <Stat
          label="Net in the pool"
          value={money(state.netInvestedBase, base)}
          sub={`across ${data.contributions.length} payments`}
        />
      </div>

      {byMonth.length > 0 && (
        <Panel>
          <PanelHeader title="Per month" subtitle="What the group raised each cycle" />
          <div className="table-wrap">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr>
                  <th className="th">Month</th>
                  <th className="th text-right">Raised</th>
                  <th className="th text-right">Contributors</th>
                </tr>
              </thead>
              <tbody>
                {byMonth.map(([month, total]) => (
                  <tr key={month} className="row">
                    <td className="td font-medium">{monthLabel(month)}</td>
                    <td className="td tnum text-right">{money(total, base)}</td>
                    <td className="td tnum text-right text-muted">
                      {
                        new Set(
                          data.contributions
                            .filter((c) => c.date.slice(0, 7) === month)
                            .map((c) => c.memberId),
                        ).size
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader
          title="Ledger"
          subtitle="Newest first. Unit price is what the fund was worth per unit that day."
        />
        {ledger.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Member</th>
                  <th className="th">Type</th>
                  <th className="th text-right">Amount</th>
                  <th className="th text-right">In {base}</th>
                  <th className="th text-right">Unit price</th>
                  <th className="th text-right">Units</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => {
                  const issued = row.kind === "in" ? state.issuance[row.id] : undefined;
                  const amountBase =
                    row.amount * (row.currency === base ? 1 : row.fxRate || 1);
                  return (
                    <tr key={row.id} className="row">
                      <td className="td text-muted">{shortDate(row.date)}</td>
                      <td className="td font-medium">{memberName(row.memberId)}</td>
                      <td className="td">
                        <span
                          className={`chip ${
                            row.kind === "in"
                              ? "border-pos/25 text-pos"
                              : "border-gold/25 text-gold"
                          }`}
                        >
                          {row.kind === "in" ? "Contribution" : "Withdrawal"}
                        </span>
                      </td>
                      <td className="td tnum text-right">
                        {money(row.amount, row.currency)}
                        {row.currency !== base && (
                          <span className="ml-1.5 text-[11px] text-faint">
                            @ {num(row.fxRate, 0)}
                          </span>
                        )}
                      </td>
                      <td className="td tnum text-right text-muted">
                        {money(amountBase, base)}
                      </td>
                      <td className="td tnum text-right text-muted">
                        {issued ? money(issued.unitPrice, base, 2) : "—"}
                      </td>
                      <td className="td tnum text-right">
                        {issued ? num(issued.units, 2) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nothing recorded yet"
            hint="Start with what everyone put in on day one."
          />
        )}
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "contribution" ? "Record contribution" : "Record withdrawal"}
      >
        {!data.members.length ? (
          <p className="text-sm text-muted">
            Add some members first — money has to belong to someone.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Member">
              <select
                className="field"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">
                <input
                  className="field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <select
                  className="field"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  <option value="NGN">NGN — naira</option>
                  <option value="USD">USD — dollars</option>
                </select>
              </Field>
            </div>

            <Field label="Amount">
              <input
                className="field tnum"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150000"
                autoFocus
              />
            </Field>

            {currency !== base && (
              <Field
                label={`Exchange rate (1 ${currency} = ? ${base})`}
                hint="The rate on the day, so the ledger converts correctly."
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

            <Field label="Note" hint="Optional.">
              <input
                className="field"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. August cycle"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
