import type { Currency, ISODate } from "./types";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
};

export function money(amount: number, currency: Currency = "NGN", dp?: number): string {
  const decimals = dp ?? (Math.abs(amount) < 1000 && amount % 1 !== 0 ? 2 : 0);
  const sign = amount < 0 ? "-" : "";
  const value = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${sign}${CURRENCY_SYMBOL[currency]}${value}`;
}

/** Compact form for headline tiles: ₦1.2m, $34.5k */
export function moneyCompact(amount: number, currency: Currency = "NGN"): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const s = CURRENCY_SYMBOL[currency];
  if (abs >= 1_000_000_000) return `${sign}${s}${(abs / 1_000_000_000).toFixed(2)}b`;
  if (abs >= 1_000_000) return `${sign}${s}${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 10_000) return `${sign}${s}${(abs / 1_000).toFixed(1)}k`;
  return money(amount, currency);
}

export function signedMoney(amount: number, currency: Currency = "NGN"): string {
  return `${amount > 0 ? "+" : ""}${money(amount, currency)}`;
}

export function pct(value: number, dp = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(dp)}%`;
}

export function signedPct(value: number, dp = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(dp)}%`;
}

export function num(value: number, dp = 2): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function shortDate(date: ISODate): string {
  const [y, m, d] = date.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
}

export function longDate(date: ISODate): string {
  const [y, m, d] = date.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** "3 days ago", "2 months ago" — used to flag stale prices. */
export function relativeAge(date: ISODate): string {
  const days = Math.round((Date.now() - Date.parse(date)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function toneClass(value: number): string {
  if (value > 0) return "text-pos";
  if (value < 0) return "text-neg";
  return "text-muted";
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Fixed categorical order, validated for colour-vision deficiency against this
 * app's dark surface (#0F1116): worst adjacent CVD ΔE 8.4, normal-vision 19.3,
 * all slots >= 3:1 contrast. The ORDER is the safety mechanism — do not reorder
 * or extend it without re-running the validator.
 */
export const SERIES_PALETTE = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
];

/** Beyond 8 members the 9th+ fold into one neutral rather than inventing hues. */
export const OVERFLOW_COLOR = "#8A91A0";

export function colorFor(index: number): string {
  return index < SERIES_PALETTE.length ? SERIES_PALETTE[index] : OVERFLOW_COLOR;
}

export function uid(prefix = ""): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${rand}` : rand;
}
