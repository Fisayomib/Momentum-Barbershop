"use client";

import React from "react";

/**
 * Horizontal magnitude bars. Deliberately a single colour: comparing sizes is
 * the job, and identity is already carried by the row label, so a categorical
 * palette here would be decoration pretending to be information.
 */
export function BarList({
  items,
  format,
  color = "#3987e5",
}: {
  items: { label: string; sub?: string; value: number }[];
  format: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);

  return (
    <ul className="divide-y divide-line/70">
      {items.map((item) => (
        <li key={item.label} className="px-5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-ink">{item.label}</span>
            <span className="tnum shrink-0 text-sm text-ink">{format(item.value)}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full rounded-full"
                style={{ width: `${(Math.abs(item.value) / max) * 100}%`, background: color }}
              />
            </div>
            {item.sub && <span className="shrink-0 text-xs text-faint">{item.sub}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Gain/loss columns around a zero baseline. Position relative to the baseline
 * and the explicit +/- sign both encode direction, so the red/green pairing is
 * never the only cue — which is what keeps it readable for red-green CVD.
 */
export function DeltaBars({
  items,
  format,
  height = 160,
}: {
  items: { label: string; value: number }[];
  format: (v: number) => string;
  height?: number;
}) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center text-xs text-faint" style={{ height }}>
        No completed months yet.
      </div>
    );
  }

  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1e-9);

  return (
    <div className="px-5 py-4">
      <div className="flex items-end gap-2" style={{ height }}>
        {items.map((item) => {
          const positive = item.value >= 0;
          const magnitude = (Math.abs(item.value) / max) * 45;
          return (
            <div key={item.label} className="group relative flex flex-1 flex-col items-center">
              <div className="relative flex w-full flex-col items-center" style={{ height }}>
                {/* upper half */}
                <div className="flex w-full flex-1 items-end justify-center">
                  {positive && (
                    <div
                      className="w-full max-w-10 rounded-t"
                      style={{ height: `${magnitude}%`, background: "#199e70" }}
                    />
                  )}
                </div>
                <div className="h-px w-full bg-line2" />
                {/* lower half */}
                <div className="flex w-full flex-1 items-start justify-center">
                  {!positive && (
                    <div
                      className="w-full max-w-10 rounded-b"
                      style={{ height: `${magnitude}%`, background: "#e66767" }}
                    />
                  )}
                </div>
              </div>
              <span className="mt-1.5 text-[10px] text-faint">{item.label}</span>
              <span
                className={`tnum text-[11px] font-medium ${
                  positive ? "text-pos" : "text-neg"
                }`}
              >
                {format(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One stacked bar showing who owns what share of the fund. Uses the validated
 * categorical order, with a 2px surface gap between segments so adjacent hues
 * never touch.
 */
export function OwnershipBar({
  segments,
}: {
  segments: { label: string; pct: number; color: string }[];
}) {
  const visible = segments.filter((s) => s.pct > 0.0005);
  if (!visible.length) return null;

  return (
    <div className="px-5 py-4">
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
        {visible.map((s) => (
          <div
            key={s.label}
            title={`${s.label} — ${(s.pct * 100).toFixed(1)}%`}
            style={{ width: `${s.pct * 100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {visible.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
            <span className="tnum text-faint">{(s.pct * 100).toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
