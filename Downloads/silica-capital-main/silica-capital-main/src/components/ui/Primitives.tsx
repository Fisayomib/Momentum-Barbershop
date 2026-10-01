"use client";

import React from "react";
import { toneClass } from "@/lib/format";

export function Panel({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`panel ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone,
  hint,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Positive/negative colouring driven by a number. */
  tone?: number;
  hint?: string;
}) {
  return (
    <div className="panel px-5 py-4" title={hint}>
      <div className="label">{label}</div>
      <div
        className={`tnum mt-2 text-2xl font-semibold tracking-tight ${
          tone === undefined ? "text-ink" : toneClass(tone)
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="text-sm text-muted">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-sm text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function Avatar({
  text,
  color,
  size = 32,
}: {
  text: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{
        width: size,
        height: size,
        background: `${color ?? "#5EE7C4"}1F`,
        color: color ?? "#5EE7C4",
        border: `1px solid ${color ?? "#5EE7C4"}33`,
      }}
    >
      {text}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative my-8 w-full ${wide ? "max-w-3xl" : "max-w-lg"} panel`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted transition hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}

export function Delta({ value, children }: { value: number; children: React.ReactNode }) {
  return <span className={`tnum ${toneClass(value)}`}>{children}</span>;
}
