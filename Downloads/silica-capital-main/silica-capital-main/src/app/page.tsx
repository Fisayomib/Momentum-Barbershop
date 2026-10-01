"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Stat, Empty, Avatar } from "@/components/ui/Primitives";
import { LineChart } from "@/components/charts/LineChart";
import { BarList, OwnershipBar } from "@/components/charts/Bars";
import {
  colorFor,
  initials,
  money,
  moneyCompact,
  num,
  pct,
  relativeAge,
  shortDate,
  signedMoney,
  signedPct,
  toneClass,
} from "@/lib/format";

export default function Dashboard() {
  const { state, data } = useStore();
  const base = data.settings.baseCurrency;

  if (!data.members.length && !data.trades.length) {
    return (
      <Panel>
        <div className="px-6 py-16 text-center">
          <h1 className="text-lg font-semibold">Welcome to Silica Capital</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Nothing recorded yet. Add the guys first, then log what everyone put in
            for the month, then the stocks you bought with it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/members" className="btn-primary">
              Add members
            </Link>
            <Link href="/settings" className="btn-ghost">
              Load demo data
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  const navSeries = state.navHistory.map((p) => ({ date: p.date, value: p.navBase }));
  const unitSeries = state.navHistory.map((p) => ({ date: p.date, value: p.unitPrice }));

  const staleCount = state.positions.filter((p) => p.priceIsStale).length;
  const latestMark = data.priceMarks
    .map((p) => p.date)
    .sort()
    .pop();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Where the pool stands{latestMark ? ` · prices last updated ${relativeAge(latestMark)}` : ""}
        </p>
      </div>

      {/* Headline numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Fund value"
          value={money(state.navBase, base)}
          sub={`${money(state.cashBase, base)} of it still in cash`}
        />
        <Stat
          label="Total profit / loss"
          value={signedMoney(state.totalProfitBase, base)}
          tone={state.totalProfitBase}
          sub={`${signedPct(state.totalProfitPct)} on ${money(state.netInvestedBase, base)} put in`}
        />
        <Stat
          label="Realised"
          value={signedMoney(state.realizedBase, base)}
          tone={state.realizedBase}
          sub="Locked in from stocks already sold"
        />
        <Stat
          label="Unrealised"
          value={signedMoney(state.unrealizedBase, base)}
          tone={state.unrealizedBase}
          sub="Paper gain on what we still hold"
        />
      </div>

      {state.warnings.length > 0 && (
        <Panel className="border-gold/25 bg-gold/[0.05]">
          <div className="px-5 py-4">
            <h3 className="text-sm font-medium text-gold">Worth checking</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {state.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
            {staleCount > 0 && (
              <Link
                href="/portfolio"
                className="mt-3 inline-block text-xs font-medium text-gold underline underline-offset-2"
              >
                Update prices →
              </Link>
            )}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Fund value over time"
            subtitle="Total worth of the pool, including cash"
          />
          <div className="px-2 py-4">
            <LineChart
              points={navSeries}
              format={(v) => moneyCompact(v, base)}
              color="#3987e5"
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Unit price"
            subtitle={`Started at ${money(data.settings.initialUnitPrice, base)}`}
          />
          <div className="px-5 py-5">
            <div className="tnum text-3xl font-semibold tracking-tight">
              {money(state.unitPrice, base, 2)}
            </div>
            <div className={`tnum mt-1 text-sm ${toneClass(state.twr)}`}>
              {signedPct(state.twr)} since we started
            </div>
            <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-muted">
              This is the honest scorecard. It strips out the effect of new money
              coming in — if the unit price is up 12%, the fund genuinely grew 12%,
              no matter how much anyone added along the way.
            </p>
          </div>
          <div className="px-2 pb-3">
            <LineChart
              points={unitSeries}
              height={120}
              format={(v) => num(v, 0)}
              color="#199e70"
              baseline={data.settings.initialUnitPrice}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Who owns what"
            subtitle="Share of the pool, by units held"
            action={
              <Link href="/members" className="text-xs text-brand hover:underline">
                Details →
              </Link>
            }
          />
          {state.members.length ? (
            <>
              <OwnershipBar
                segments={state.members.map((m, i) => ({
                  label: m.member.name,
                  pct: m.ownershipPct,
                  color: colorFor(i),
                }))}
              />
              <div className="table-wrap border-t border-line">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr>
                      <th className="th">Member</th>
                      <th className="th text-right">Put in</th>
                      <th className="th text-right">Worth now</th>
                      <th className="th text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.members.map((m, i) => (
                      <tr key={m.member.id} className="row">
                        <td className="td">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              text={initials(m.member.name)}
                              color={colorFor(i)}
                              size={28}
                            />
                            <span className="font-medium">{m.member.name}</span>
                          </div>
                        </td>
                        <td className="td tnum text-right text-muted">
                          {money(m.netInvestedBase, base)}
                        </td>
                        <td className="td tnum text-right font-medium">
                          {money(m.currentValueBase, base)}
                        </td>
                        <td className={`td tnum text-right ${toneClass(m.profitBase)}`}>
                          {signedMoney(m.profitBase, base)}
                          <span className="ml-1.5 text-xs opacity-70">
                            {signedPct(m.profitPct)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Empty title="No members yet" hint="Add the guys on the Members page." />
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="What we're holding"
            subtitle="Current market value of each position"
            action={
              <Link href="/portfolio" className="text-xs text-brand hover:underline">
                Details →
              </Link>
            }
          />
          {state.positions.length ? (
            <BarList
              items={state.positions.map((p) => ({
                label: p.symbol,
                sub: signedPct(p.unrealizedPct),
                value: p.marketValueBase,
              }))}
              format={(v) => money(v, base)}
            />
          ) : (
            <Empty
              title="Nothing held right now"
              hint="Record a buy on the Trades page and it will show up here."
            />
          )}
        </Panel>
      </div>

      {state.closedTrades.length > 0 && (
        <Panel>
          <PanelHeader
            title="Recently closed"
            subtitle="Positions we sold and what they actually made"
            action={
              <Link href="/insights" className="text-xs text-brand hover:underline">
                Full breakdown →
              </Link>
            }
          />
          <div className="table-wrap">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="th">Stock</th>
                  <th className="th">Closed</th>
                  <th className="th text-right">Held for</th>
                  <th className="th text-right">Result</th>
                  <th className="th text-right">Return</th>
                </tr>
              </thead>
              <tbody>
                {state.closedTrades.slice(0, 5).map((t, i) => (
                  <tr key={`${t.symbol}-${t.closedOn}-${i}`} className="row">
                    <td className="td font-medium">{t.symbol}</td>
                    <td className="td text-muted">{shortDate(t.closedOn)}</td>
                    <td className="td tnum text-right text-muted">
                      {t.holdingDays !== undefined ? `${t.holdingDays}d` : "—"}
                    </td>
                    <td className={`td tnum text-right ${toneClass(t.realizedBase)}`}>
                      {signedMoney(t.realizedBase, base)}
                    </td>
                    <td className={`td tnum text-right ${toneClass(t.realizedPct)}`}>
                      {signedPct(t.realizedPct)}
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
