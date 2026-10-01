"use client";

import React, { useMemo, useRef, useState } from "react";

export interface LinePoint {
  date: string;
  value: number;
}

/**
 * Single-series time chart with a crosshair + tooltip. One series means no
 * legend is needed — the panel title names it.
 */
export function LineChart({
  points,
  height = 220,
  format,
  color = "#3987e5",
  baseline,
}: {
  points: LinePoint[];
  height?: number;
  format: (v: number) => string;
  color?: string;
  /** Draws a reference line (e.g. the starting unit price = break-even). */
  baseline?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 800;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 26, left: 62 };

  const geometry = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => p.value);
    if (baseline !== undefined) values.push(baseline);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    // Breathing room so the line never touches the frame.
    const pad = (max - min) * 0.12;
    min -= pad;
    max += pad;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
    const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
    const area = `${line} L${x(points.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`;

    const ticks = Array.from({ length: 4 }, (_, i) => min + ((max - min) * (i + 0.5)) / 4);

    return { x, y, line, area, min, max, ticks, innerW, innerH };
  }, [points, H, baseline]);

  if (!geometry) {
    return (
      <div className="flex items-center justify-center text-xs text-faint" style={{ height }}>
        Not enough history to chart yet — add a couple of price updates.
      </div>
    );
  }

  const { x, y, line, area, ticks } = geometry;
  const active = hover !== null ? points[hover] : null;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const svgX = ratio * W;
    const innerRatio = (svgX - PAD.left) / (W - PAD.left - PAD.right);
    const idx = Math.round(innerRatio * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const gradientId = React.useId();

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Recessive grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#1E222C"
              strokeWidth="1"
            />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5A6170">
              {format(t)}
            </text>
          </g>
        ))}

        {baseline !== undefined && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(baseline)}
            y2={y(baseline)}
            stroke="#5A6170"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* First / last date labels only — dense axes are noise here. */}
        <text x={PAD.left} y={H - 8} fontSize="11" fill="#5A6170">
          {points[0].date}
        </text>
        <text x={W - PAD.right} y={H - 8} fontSize="11" fill="#5A6170" textAnchor="end">
          {points[points.length - 1].date}
        </text>

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#2A2F3B"
              strokeWidth="1"
            />
            {/* 2px surface ring so the marker reads against the line */}
            <circle cx={x(hover)} cy={y(points[hover].value)} r="6" fill="#0F1116" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="4" fill={color} />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-line2 bg-panel2/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{
            left: `${(x(hover!) / W) * 100}%`,
            transform:
              x(hover!) / W > 0.7 ? "translateX(-105%)" : "translateX(8px)",
          }}
        >
          <div className="text-faint">{active.date}</div>
          <div className="tnum mt-0.5 font-semibold text-ink">{format(active.value)}</div>
        </div>
      )}
    </div>
  );
}
