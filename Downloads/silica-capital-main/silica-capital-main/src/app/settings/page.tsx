"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Panel, PanelHeader, Field } from "@/components/ui/Primitives";
import { money, num } from "@/lib/format";
import type { FundData } from "@/lib/types";

export default function SettingsPage() {
  const { data, state, updateSettings, resetToDemo, clearAll, replaceAll, mode } = useStore();
  const base = data.settings.baseCurrency;
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `silica-capital-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Type", "Date", "Member/Symbol", "Side", "Quantity", "Price", "Amount", "Currency", "FX", "Note"],
      ...data.contributions.map((c) => [
        "Contribution", c.date,
        data.members.find((m) => m.id === c.memberId)?.name ?? c.memberId,
        "", "", "", String(c.amount), c.currency, String(c.fxRate), c.note ?? "",
      ]),
      ...data.withdrawals.map((w) => [
        "Withdrawal", w.date,
        data.members.find((m) => m.id === w.memberId)?.name ?? w.memberId,
        "", "", "", String(w.amount), w.currency, String(w.fxRate), w.note ?? "",
      ]),
      ...data.trades.map((t) => [
        "Trade", t.date, t.symbol, t.side, String(t.quantity), String(t.price),
        String(t.quantity * t.price), t.currency, String(t.fxRate), t.thesis ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `silica-capital-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as FundData;
        if (!parsed.settings || !Array.isArray(parsed.members)) {
          throw new Error("That file isn't a Silica Capital export.");
        }
        if (
          !confirm(
            "Importing replaces everything currently in the app. Export a backup first if you're not sure. Continue?",
          )
        )
          return;
        replaceAll({
          settings: parsed.settings,
          members: parsed.members ?? [],
          contributions: parsed.contributions ?? [],
          withdrawals: parsed.withdrawals ?? [],
          trades: parsed.trades ?? [],
          priceMarks: parsed.priceMarks ?? [],
          fxMarks: parsed.fxMarks ?? [],
        });
      } catch (e) {
        setImportError(e instanceof Error ? e.message : "Could not read that file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Fund setup, backups, and where data lives.</p>
      </div>

      <Panel>
        <PanelHeader title="The fund" />
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Fund name">
            <input
              className="field"
              value={data.settings.fundName}
              onChange={(e) => updateSettings({ fundName: e.target.value })}
            />
          </Field>
          <Field label="Started on" hint="The date the group put in the first money.">
            <input
              className="field"
              type="date"
              value={data.settings.inceptionDate}
              onChange={(e) => updateSettings({ inceptionDate: e.target.value })}
            />
          </Field>
          <Field
            label="Base currency"
            hint="Everything is reported in this. Changing it later will not re-convert old entries."
          >
            <select
              className="field"
              value={data.settings.baseCurrency}
              onChange={(e) =>
                updateSettings({ baseCurrency: e.target.value as "NGN" | "USD" })
              }
            >
              <option value="NGN">NGN — naira</option>
              <option value="USD">USD — dollars</option>
            </select>
          </Field>
          <Field
            label="Starting unit price"
            hint="Cosmetic — it just sets the scale of the unit numbers. 100 is a good default."
          >
            <input
              className="field tnum"
              type="number"
              step="any"
              min="0.0001"
              value={data.settings.initialUnitPrice}
              onChange={(e) =>
                updateSettings({ initialUnitPrice: Number(e.target.value) || 100 })
              }
            />
          </Field>
        </div>
        <div className="border-t border-line px-5 py-4 text-xs text-muted">
          Current unit price:{" "}
          <span className="tnum text-ink">{money(state.unitPrice, base, 2)}</span> ·{" "}
          {num(state.totalUnits, 2)} units outstanding across {data.members.length} members
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Where the data lives"
          subtitle={mode === "supabase" ? "Shared — Supabase" : "This browser only"}
        />
        <div className="px-5 py-5 text-sm text-muted">
          {mode === "supabase" ? (
            <p>
              Connected to Supabase. Everyone who opens this app sees the same
              numbers, and changes save straight away.
            </p>
          ) : (
            <div className="space-y-3">
              <p>
                Right now everything saves to this browser on this device. That's
                fine while you're setting up, but the guys can't see it and clearing
                your browser data would wipe it.
              </p>
              <p className="text-xs leading-relaxed">
                To make it shared: create a free project at{" "}
                <span className="text-ink">supabase.com</span>, run{" "}
                <code className="rounded bg-panel2 px-1.5 py-0.5 text-[11px] text-ink">
                  supabase/schema.sql
                </code>{" "}
                in its SQL editor, then copy{" "}
                <code className="rounded bg-panel2 px-1.5 py-0.5 text-[11px] text-ink">
                  .env.local.example
                </code>{" "}
                to{" "}
                <code className="rounded bg-panel2 px-1.5 py-0.5 text-[11px] text-ink">
                  .env.local
                </code>{" "}
                and paste in your project URL and anon key. Export a backup below
                first, then import it once you're connected.
              </p>
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Backup"
          subtitle="Export regularly — this is your safety net"
        />
        <div className="flex flex-wrap gap-2 px-5 py-5">
          <button className="btn-ghost" onClick={exportJson}>
            Export backup (JSON)
          </button>
          <button className="btn-ghost" onClick={exportCsv}>
            Export for Excel (CSV)
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJson(file);
              e.target.value = "";
            }}
          />
        </div>
        {importError && (
          <div className="border-t border-line px-5 py-3 text-sm text-neg">{importError}</div>
        )}
      </Panel>

      <Panel className="border-neg/20">
        <PanelHeader title="Danger zone" />
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Load demo data</div>
              <div className="text-xs text-muted">
                Replaces everything with the sample fund, for showing people how it works.
              </div>
            </div>
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm("Replace everything with demo data? Export a backup first if you have real entries."))
                  resetToDemo();
              }}
            >
              Load demo
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div>
              <div className="text-sm font-medium">Clear everything</div>
              <div className="text-xs text-muted">
                Wipes members, contributions, trades and prices. Keeps your fund settings.
              </div>
            </div>
            <button
              className="btn-danger"
              onClick={() => {
                if (
                  confirm(
                    "This deletes every member, contribution, trade and price. It cannot be undone. Continue?",
                  )
                )
                  clearAll();
              }}
            >
              Clear everything
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
