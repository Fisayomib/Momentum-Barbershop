"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Empty } from "@/components/ui/Primitives";
import { DeltaBars } from "@/components/charts/Bars";
import { money, num, signedMoney, signedPct, toneClass } from "@/lib/format";
import { monthlyBreakdown } from "@/lib/fund";

export default function MonthsPage() {
  const { data, state } = useStore();
  const base = data.settings.baseCurrency;

  const rows = useMemo(() => monthlyBreakdown(data, state), [data, state]);
  const reversed = useMemo(() => [...rows].reverse(), [rows]);

  const best = rows.reduce<(typeof rows)[number] | null>(
    (b, r) => (!b || r.returnPct > b.returnPct ? r : b),
    null,
  );
  const worst = rows.reduce<(typeof rows)[number] | null>(
    (w, r) => (!w || r.returnPct < w.returnPct ? r : w),
    null,
  );
  const positiveMonths = rows.filter((r) => r.returnPct > 0).length;

  if (!rows.length) {
    return (
      <Panel>
        <Empty
          title="No months to show yet"
          hint="Once there are contributions and a price update or two, the monthly breakdown fills in."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Months</h1>
        <p className="mt-1 text-sm text-muted">
          How each cycle actually performed — measured on unit price, so new money
          doesn't flatter the numbers.
        </p>
      </div>

      <Panel>
        <PanelHeader
          title="Monthly return"
          subtitle={`${positiveMonths} of ${rows.length} months positive`}
        />
        <DeltaBars
          items={rows.map((r) => ({ label: r.label.split(" ")[0], value: r.returnPct }))}
          format={(v) => signedPct(v, 1)}
        />
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <div className="px-5 py-4">
            <div className="label">Best month</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-semibold">{best?.label}</span>
              <span className={`tnum text-sm ${toneClass(best?.returnPct ?? 0)}`}>
                {signedPct(best?.returnPct ?? 0)}
              </span>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-4">
            <div className="label">Worst month</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-semibold">{worst?.label}</span>
              <span className={`tnum text-sm ${toneClass(worst?.returnPct ?? 0)}`}>
                {signedPct(worst?.returnPct ?? 0)}
              </span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Cycle by cycle"
          subtitle="Newest first"
        />
        <div className="table-wrap">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr>
                <th className="th">Month</th>
                <th className="th text-right">Raised</th>
                <th className="th text-right">Paid out</th>
                <th className="th text-right">Trades</th>
                <th className="th text-right">Realised</th>
                <th className="th text-right">Unit price</th>
                <th className="th text-right">Return</th>
                <th className="th text-right">Fund value</th>
              </tr>
            </thead>
            <tbody>
              {reversed.map((r) => (
                <tr key={r.month} className="row">
                  <td className="td font-medium">{r.label}</td>
                  <td className="td tnum text-right text-muted">
                    {r.contributionsBase ? money(r.contributionsBase, base) : "—"}
                  </td>
                  <td className="td tnum text-right text-muted">
                    {r.withdrawalsBase ? money(r.withdrawalsBase, base) : "—"}
                  </td>
                  <td className="td tnum text-right text-muted">{r.tradeCount || "—"}</td>
                  <td className={`td tnum text-right ${toneClass(r.realizedBase)}`}>
                    {r.realizedBase ? signedMoney(r.realizedBase, base) : "—"}
                  </td>
                  <td className="td tnum text-right text-muted">
                    {num(r.openUnitPrice, 2)} → {num(r.closeUnitPrice, 2)}
                  </td>
                  <td className={`td tnum text-right font-medium ${toneClass(r.returnPct)}`}>
                    {signedPct(r.returnPct)}
                  </td>
                  <td className="td tnum text-right">{money(r.closeNavBase, base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <div className="px-5 py-4">
          <h3 className="text-sm font-medium">Reading this table</h3>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
            <span className="text-ink">Return</span> is the change in unit price over
            the month. It answers "did our stock picks work?" — nothing else.{" "}
            <span className="text-ink">Fund value</span> will usually rise even in a
            bad month because fresh contributions land, so don't read growth in that
            column as performance. A month where you raised{" "}
            {money(200_000, base)} and the fund grew by {money(180_000, base)} was a{" "}
            <em>losing</em> month.
          </p>
        </div>
      </Panel>
    </div>
  );
}
