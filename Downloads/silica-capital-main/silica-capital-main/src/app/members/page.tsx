"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Modal, Field, Empty, Avatar } from "@/components/ui/Primitives";
import { OwnershipBar } from "@/components/charts/Bars";
import {
  colorFor,
  initials,
  money,
  num,
  pct,
  shortDate,
  signedMoney,
  signedPct,
  toneClass,
} from "@/lib/format";
import { todayISO } from "@/lib/fund";

export default function MembersPage() {
  const { state, data, addMember, removeMember } = useStore();
  const base = data.settings.baseCurrency;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joinedAt, setJoinedAt] = useState(todayISO());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMember({ name: name.trim(), email: email.trim() || undefined, joinedAt, active: true });
    setName("");
    setEmail("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted">
            Everyone's stake, worked out from the units their money bought.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          Add member
        </button>
      </div>

      {state.members.length > 0 && (
        <Panel>
          <PanelHeader title="Split of the pool" subtitle="By units held today" />
          <OwnershipBar
            segments={state.members.map((m, i) => ({
              label: m.member.name,
              pct: m.ownershipPct,
              color: colorFor(i),
            }))}
          />
        </Panel>
      )}

      <Panel>
        <PanelHeader
          title="Standings"
          subtitle="Profit is what their stake is worth now, minus what they actually put in"
        />
        {state.members.length ? (
          <div className="table-wrap">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr>
                  <th className="th">Member</th>
                  <th className="th text-right">Units</th>
                  <th className="th text-right">Share</th>
                  <th className="th text-right">Contributed</th>
                  <th className="th text-right">Withdrawn</th>
                  <th className="th text-right">Worth now</th>
                  <th className="th text-right">Profit</th>
                  <th className="th text-right" title="Annualised return on their own money, accounting for when they paid it in">
                    Ann. return
                  </th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody>
                {state.members.map((m, i) => (
                  <tr key={m.member.id} className="row">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <Avatar text={initials(m.member.name)} color={colorFor(i)} size={30} />
                        <div>
                          <div className="font-medium">{m.member.name}</div>
                          <div className="text-[11px] text-faint">
                            {m.firstContribution
                              ? `since ${shortDate(m.firstContribution)}`
                              : "no money in yet"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="td tnum text-right text-muted">{num(m.units, 2)}</td>
                    <td className="td tnum text-right">{pct(m.ownershipPct)}</td>
                    <td className="td tnum text-right text-muted">
                      {money(m.contributedBase, base)}
                    </td>
                    <td className="td tnum text-right text-muted">
                      {m.withdrawnBase ? money(m.withdrawnBase, base) : "—"}
                    </td>
                    <td className="td tnum text-right font-medium">
                      {money(m.currentValueBase, base)}
                    </td>
                    <td className={`td tnum text-right ${toneClass(m.profitBase)}`}>
                      <div>{signedMoney(m.profitBase, base)}</div>
                      <div className="text-[11px] opacity-70">{signedPct(m.profitPct)}</div>
                    </td>
                    <td className={`td tnum text-right ${toneClass(m.irr ?? 0)}`}>
                      {m.irr === null ? "—" : signedPct(m.irr)}
                    </td>
                    <td className="td text-right">
                      {/*
                        Removing a member used to delete their contributions with
                        them — a back door around the append-only ledger that
                        would silently restate everyone else's share. Only
                        members with no financial history can be removed now,
                        which still covers the real case: someone added by
                        mistake or a misspelled name.
                      */}
                      {m.contributedBase === 0 && m.withdrawnBase === 0 ? (
                        <button
                          className="text-xs text-faint transition hover:text-neg"
                          onClick={() => {
                            if (confirm(`Remove ${m.member.name}? They have no contributions recorded.`)) {
                              removeMember(m.member.id);
                            }
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <span
                          className="text-xs text-faint/60"
                          title="Members with contributions can't be removed — it would rewrite everyone else's share. Ask Fisayo if this is genuinely wrong."
                        >
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line2">
                  <td className="td font-medium">Total</td>
                  <td className="td tnum text-right text-muted">{num(state.totalUnits, 2)}</td>
                  <td className="td tnum text-right">100.0%</td>
                  <td className="td tnum text-right text-muted">
                    {money(state.contributedBase, base)}
                  </td>
                  <td className="td tnum text-right text-muted">
                    {state.withdrawnBase ? money(state.withdrawnBase, base) : "—"}
                  </td>
                  <td className="td tnum text-right font-medium">
                    {money(state.navBase, base)}
                  </td>
                  <td className={`td tnum text-right ${toneClass(state.totalProfitBase)}`}>
                    {signedMoney(state.totalProfitBase, base)}
                  </td>
                  <td className="td" />
                  <td className="td" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <Empty
            title="No members yet"
            hint="Add everyone in the group, then log what each person contributed."
          />
        )}
      </Panel>

      <Panel>
        <div className="px-5 py-4">
          <h3 className="text-sm font-medium">Why the shares aren't just "amount ÷ total"</h3>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
            When someone joins in month four, the money already in the pool has been
            working for three months. Splitting by share-of-total-contributions would
            hand them a slice of gains they weren't around for — paid for by whoever
            was. So instead every contribution buys{" "}
            <span className="text-ink">units</span> at the price on the day it lands.
            Later contributions buy units at a higher price if the fund has grown, so
            they get proportionally fewer. Everyone's stake then just tracks their own
            units. It's how real funds do it, and it's fair by construction.
          </p>
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Add member">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name">
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tunde"
              autoFocus
            />
          </Field>
          <Field label="Email" hint="Optional — used later if you move to shared mode.">
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="optional"
            />
          </Field>
          <Field label="Joined" hint="Doesn't affect the maths — their first contribution does.">
            <input
              className="field"
              type="date"
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
