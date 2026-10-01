import type {
  ClosedTrade,
  Contribution,
  Currency,
  FundData,
  FundState,
  ISODate,
  MemberStanding,
  NavPoint,
  Position,
  Trade,
  Withdrawal,
} from "./types";

// ---------------------------------------------------------------------------
// The unit ledger
// ---------------------------------------------------------------------------
//
// Silica Capital is a pooled fund with unequal contributions arriving on
// different dates. Splitting profit by "share of total money contributed" is
// wrong: it pays late contributors out of gains earned before they joined.
//
// Instead the fund is *unitised*, exactly like a mutual fund:
//
//   unit price = net asset value / units outstanding
//   a contribution BUYS units at the unit price on the day it lands
//   a member's stake = their units x today's unit price
//
// Units are only created (contribution) or destroyed (withdrawal). Trading
// profit moves the unit *price*, which lifts every holder proportionally to
// how long their money has actually been at work. That is the whole trick.
//
// Cost basis on sales is average cost, which is the convention nearly every
// investment club uses and the only one that survives partial sells without a
// lot-tracking UI.

/** Same-day ordering: pool the money, then trade it, then pay anyone out. */
const EVENT_ORDER = { contribution: 0, trade: 1, withdrawal: 2 } as const;

type Event =
  | { kind: "contribution"; date: ISODate; data: Contribution }
  | { kind: "trade"; date: ISODate; data: Trade }
  | { kind: "withdrawal"; date: ISODate; data: Withdrawal };

export function todayISO(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

function round(n: number, dp = 8): number {
  const f = Math.pow(10, dp);
  return Math.round((n + Number.EPSILON) * f) / f;
}

function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Rate lookups
// ---------------------------------------------------------------------------

interface TimeSeriesPoint {
  date: ISODate;
  value: number;
}

/**
 * Latest point on or before `date`, or undefined if the series hasn't started.
 *
 * Strictly backward-looking on purpose. Falling back to the earliest known point
 * would apply a *future* price to a past date — which silently back-dates gains
 * that hadn't happened yet and makes early months look brilliant. Callers decide
 * what to do with undefined; for prices the right answer is cost basis.
 */
function asOf(series: TimeSeriesPoint[], date: ISODate): number | undefined {
  let found: number | undefined;
  for (const p of series) {
    if (p.date <= date) found = p.value;
    else break;
  }
  return found;
}

/**
 * Builds a dense FX timeline per currency. Explicit FX marks are authoritative;
 * on top of that we harvest the implied rate from every trade, contribution and
 * withdrawal booked in a foreign currency, so the user gets a usable series
 * without having to maintain one by hand.
 */
function buildFxSeries(data: FundData): Record<string, TimeSeriesPoint[]> {
  const series: Record<string, TimeSeriesPoint[]> = {};
  const push = (currency: Currency, date: ISODate, rate: number) => {
    if (currency === data.settings.baseCurrency) return;
    if (!Number.isFinite(rate) || rate <= 0) return;
    (series[currency] ??= []).push({ date, value: rate });
  };

  for (const t of data.trades) push(t.currency, t.date, t.fxRate);
  for (const c of data.contributions) push(c.currency, c.date, c.fxRate);
  for (const w of data.withdrawals) push(w.currency, w.date, w.fxRate);
  // Explicit marks last so they win ties on the same date.
  for (const f of data.fxMarks) push(f.currency, f.date, f.rate);

  for (const key of Object.keys(series)) {
    series[key].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }
  return series;
}

function buildPriceSeries(data: FundData): Record<string, TimeSeriesPoint[]> {
  const series: Record<string, TimeSeriesPoint[]> = {};
  for (const m of data.priceMarks) {
    (series[m.symbol.toUpperCase()] ??= []).push({ date: m.date, value: m.price });
  }
  for (const key of Object.keys(series)) {
    series[key].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }
  return series;
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

interface WorkingPosition {
  symbol: string;
  name?: string;
  market: Position["market"];
  currency: Currency;
  quantity: number;
  costNative: number;
  costBase: number;
  firstBuyDate?: ISODate;
}

export function computeFund(data: FundData, valuationDateIn?: ISODate): FundState {
  const { settings } = data;
  const base = settings.baseCurrency;
  const warnings: string[] = [];

  const fxSeries = buildFxSeries(data);
  const priceSeries = buildPriceSeries(data);

  /**
   * Unlike prices, an FX rate from before our series starts is still a far
   * better estimate than nothing — defaulting to 1 would value a dollar at one
   * naira. So here the earliest-known fallback is the right call.
   */
  const fxAt = (currency: Currency, date: ISODate): number => {
    if (currency === base) return 1;
    const series = fxSeries[currency] ?? [];
    return asOf(series, date) ?? series[0]?.value ?? 1;
  };

  const events: Event[] = [
    ...data.contributions.map((data) => ({ kind: "contribution" as const, date: data.date, data })),
    ...data.trades.map((data) => ({ kind: "trade" as const, date: data.date, data })),
    ...data.withdrawals.map((data) => ({ kind: "withdrawal" as const, date: data.date, data })),
  ].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return EVENT_ORDER[a.kind] - EVENT_ORDER[b.kind];
  });

  const lastEventDate = events.length ? events[events.length - 1].date : settings.inceptionDate;
  const lastMarkDate = data.priceMarks.reduce<ISODate>((m, p) => (p.date > m ? p.date : m), "");
  const today = todayISO();
  const valuationDate = valuationDateIn ?? [today, lastEventDate, lastMarkDate].sort().pop()!;

  // Running state
  const cash: Record<Currency, number> = { NGN: 0, USD: 0 };
  const positions = new Map<string, WorkingPosition>();
  const units = new Map<string, number>();
  const closedTrades: ClosedTrade[] = [];
  const issuance: FundState["issuance"] = {};
  let totalUnits = 0;
  let realizedBase = 0;
  let feesBase = 0;

  /**
   * Spending foreign currency we don't hold implies an FX conversion: the
   * shortfall is drawn from base-currency cash at the rate on the deal. Without
   * this, buying a US stock out of a naira pool would show a negative dollar
   * balance forever.
   */
  const spend = (currency: Currency, amount: number, fx: number) => {
    if (currency === base) {
      cash[base] -= amount;
      return;
    }
    const available = Math.max(0, cash[currency]);
    const fromForeign = Math.min(available, amount);
    cash[currency] -= fromForeign;
    const shortfall = amount - fromForeign;
    if (shortfall > 0) cash[base] -= shortfall * fx;
  };

  /** Mark-to-market NAV of everything the fund owns, at `date`, in base currency. */
  const navAt = (date: ISODate): number => {
    let nav = 0;
    for (const currency of ["NGN", "USD"] as Currency[]) {
      if (cash[currency]) nav += cash[currency] * fxAt(currency, date);
    }
    for (const p of Array.from(positions.values())) {
      if (p.quantity <= 0) continue;
      const marked = asOf(priceSeries[p.symbol] ?? [], date);
      const price = marked ?? p.costNative / p.quantity;
      nav += p.quantity * price * fxAt(p.currency, date);
    }
    return nav;
  };

  /** Unit price at `date`, given current state. Falls back to par when no units exist. */
  const unitPriceAt = (date: ISODate): number => {
    if (totalUnits <= 0) return settings.initialUnitPrice;
    const nav = navAt(date);
    if (nav <= 0) {
      warnings.push(
        `Fund value was zero or negative on ${date} while units were outstanding — unit price floored to avoid divide-by-zero.`,
      );
      return 1e-9;
    }
    return nav / totalUnits;
  };

  // --- walk the ledger ------------------------------------------------------

  const navHistory: NavPoint[] = [];
  const allDates = Array.from(
    new Set<ISODate>(
      events
        .map((e) => e.date)
        .concat(data.priceMarks.map((m) => m.date))
        .concat([valuationDate]),
    ),
  ).sort();

  let cursor = 0;
  for (const date of allDates) {
    while (cursor < events.length && events[cursor].date === date) {
      const ev = events[cursor++];

      if (ev.kind === "contribution") {
        const c = ev.data;
        const amountBase = c.amount * (c.currency === base ? 1 : c.fxRate || fxAt(c.currency, date));
        const price = unitPriceAt(date);
        const issued = amountBase / price;
        units.set(c.memberId, (units.get(c.memberId) ?? 0) + issued);
        totalUnits += issued;
        cash[c.currency] += c.amount;
        issuance[c.id] = { units: round(issued, 6), unitPrice: round(price, 6), amountBase: round(amountBase, 2) };
        continue;
      }

      if (ev.kind === "withdrawal") {
        const w = ev.data;
        const amountBase = w.amount * (w.currency === base ? 1 : w.fxRate || fxAt(w.currency, date));
        const price = unitPriceAt(date);
        const redeemed = amountBase / price;
        const held = units.get(w.memberId) ?? 0;
        if (redeemed > held + 1e-6) {
          warnings.push(
            `Withdrawal on ${date} is larger than that member's stake — their unit balance was floored at zero.`,
          );
        }
        units.set(w.memberId, Math.max(0, held - redeemed));
        totalUnits = Math.max(0, totalUnits - Math.min(redeemed, held));
        spend(w.currency, w.amount, w.currency === base ? 1 : w.fxRate || fxAt(w.currency, date));
        continue;
      }

      // --- trade ---
      const t = ev.data;
      const symbol = t.symbol.toUpperCase();
      const fx = t.currency === base ? 1 : t.fxRate || fxAt(t.currency, date);
      const gross = t.quantity * t.price;
      const fees = t.fees || 0;
      feesBase += fees * fx;

      let pos = positions.get(symbol);
      if (!pos) {
        pos = {
          symbol,
          name: t.name,
          market: t.market,
          currency: t.currency,
          quantity: 0,
          costNative: 0,
          costBase: 0,
        };
        positions.set(symbol, pos);
      }
      if (t.name && !pos.name) pos.name = t.name;

      if (t.side === "BUY") {
        const outlay = gross + fees;
        spend(t.currency, outlay, fx);
        if (pos.quantity <= 0) pos.firstBuyDate = date;
        pos.quantity += t.quantity;
        pos.costNative += outlay;
        pos.costBase += outlay * fx;
      } else {
        if (t.quantity > pos.quantity + 1e-9) {
          warnings.push(
            `Sold ${t.quantity} ${symbol} on ${date} but only ${round(pos.quantity, 4)} were held — recorded as closing the whole position.`,
          );
        }
        const qty = Math.min(t.quantity, pos.quantity);
        const proceeds = qty * t.price - fees;
        cash[t.currency] += proceeds;

        const avgNative = pos.quantity > 0 ? pos.costNative / pos.quantity : 0;
        const avgBase = pos.quantity > 0 ? pos.costBase / pos.quantity : 0;
        const costOutNative = avgNative * qty;
        const costOutBase = avgBase * qty;

        const gainNative = proceeds - costOutNative;
        // Realised in base uses today's FX on the proceeds vs the FX actually
        // paid on the way in — so currency moves show up in the P/L, correctly.
        const gainBase = proceeds * fx - costOutBase;
        realizedBase += gainBase;

        closedTrades.push({
          symbol,
          currency: t.currency,
          quantity: qty,
          openedOn: pos.firstBuyDate,
          closedOn: date,
          proceedsNative: proceeds,
          costNative: costOutNative,
          realizedNative: gainNative,
          realizedBase: gainBase,
          realizedPct: costOutNative > 0 ? gainNative / costOutNative : 0,
          holdingDays: pos.firstBuyDate ? daysBetween(pos.firstBuyDate, date) : undefined,
          thesis: t.thesis,
        });

        pos.quantity -= qty;
        pos.costNative -= costOutNative;
        pos.costBase -= costOutBase;
        if (pos.quantity <= 1e-9) {
          pos.quantity = 0;
          pos.costNative = 0;
          pos.costBase = 0;
          pos.firstBuyDate = undefined;
        }
      }
    }

    navHistory.push({
      date,
      navBase: round(navAt(date), 2),
      totalUnits: round(totalUnits, 6),
      unitPrice: round(totalUnits > 0 ? navAt(date) / totalUnits : settings.initialUnitPrice, 6),
    });
  }

  // --- final valuation ------------------------------------------------------

  const finalPositions: Position[] = [];
  let unrealizedBase = 0;
  let investedBase = 0;

  for (const p of positions.values()) {
    if (p.quantity <= 0) continue;
    const marks = priceSeries[p.symbol] ?? [];
    const marked = asOf(marks, valuationDate);
    const priceIsStale = marked === undefined;
    const lastPriceNative = marked ?? p.costNative / p.quantity;
    const lastPriceDate = [...marks].reverse().find((m) => m.date <= valuationDate)?.date;
    const fx = fxAt(p.currency, valuationDate);

    const marketValueNative = p.quantity * lastPriceNative;
    const marketValueBase = marketValueNative * fx;
    const unrealizedNative = marketValueNative - p.costNative;
    const unrealizedB = marketValueBase - p.costBase;

    unrealizedBase += unrealizedB;
    investedBase += p.costBase;

    if (priceIsStale) {
      warnings.push(`${p.symbol} has no price recorded — it is being valued at cost.`);
    }

    finalPositions.push({
      symbol: p.symbol,
      name: p.name,
      market: p.market,
      currency: p.currency,
      quantity: round(p.quantity, 6),
      costNative: round(p.costNative, 2),
      costBase: round(p.costBase, 2),
      avgCostNative: round(p.quantity > 0 ? p.costNative / p.quantity : 0, 4),
      lastPriceNative: round(lastPriceNative, 4),
      priceIsStale,
      lastPriceDate,
      marketValueNative: round(marketValueNative, 2),
      marketValueBase: round(marketValueBase, 2),
      unrealizedNative: round(unrealizedNative, 2),
      unrealizedBase: round(unrealizedB, 2),
      unrealizedPct: p.costBase > 0 ? unrealizedB / p.costBase : 0,
      unrealizedPctNative: p.costNative > 0 ? unrealizedNative / p.costNative : 0,
    });
  }

  finalPositions.sort((a, b) => b.marketValueBase - a.marketValueBase);

  // Negative cash is arithmetically fine but operationally a red flag: it means
  // more was spent or paid out than the fund actually held, so something has to
  // be sold to settle it.
  for (const currency of ["NGN", "USD"] as Currency[]) {
    if (cash[currency] < -0.01) {
      warnings.push(
        `${currency} cash is overdrawn by ${Math.abs(cash[currency]).toFixed(2)} — a buy or payout exceeded what the fund held, so a position needs selling to cover it.`,
      );
    }
  }

  const cashBase =
    cash.NGN * fxAt("NGN", valuationDate) + cash.USD * fxAt("USD", valuationDate);
  const navBase = cashBase + finalPositions.reduce((s, p) => s + p.marketValueBase, 0);
  const unitPrice = totalUnits > 0 ? navBase / totalUnits : settings.initialUnitPrice;

  const contributedBase = data.contributions.reduce(
    (s, c) => s + c.amount * (c.currency === base ? 1 : c.fxRate || fxAt(c.currency, c.date)),
    0,
  );
  const withdrawnBase = data.withdrawals.reduce(
    (s, w) => s + w.amount * (w.currency === base ? 1 : w.fxRate || fxAt(w.currency, w.date)),
    0,
  );
  const netInvestedBase = contributedBase - withdrawnBase;
  const totalProfitBase = navBase - netInvestedBase;

  // --- per-member standings -------------------------------------------------

  const memberStandings: MemberStanding[] = data.members.map((member) => {
    const u = units.get(member.id) ?? 0;
    const mine = data.contributions.filter((c) => c.memberId === member.id);
    const myWithdrawals = data.withdrawals.filter((w) => w.memberId === member.id);

    const contributed = mine.reduce(
      (s, c) => s + c.amount * (c.currency === base ? 1 : c.fxRate || fxAt(c.currency, c.date)),
      0,
    );
    const withdrawn = myWithdrawals.reduce(
      (s, w) => s + w.amount * (w.currency === base ? 1 : w.fxRate || fxAt(w.currency, w.date)),
      0,
    );
    const netInvested = contributed - withdrawn;
    const currentValue = u * unitPrice;
    const profit = currentValue - netInvested;

    const flows = [
      ...mine.map((c) => ({
        date: c.date,
        amount: -c.amount * (c.currency === base ? 1 : c.fxRate || fxAt(c.currency, c.date)),
      })),
      ...myWithdrawals.map((w) => ({
        date: w.date,
        amount: w.amount * (w.currency === base ? 1 : w.fxRate || fxAt(w.currency, w.date)),
      })),
    ].sort((a, b) => (a.date < b.date ? -1 : 1));
    if (currentValue > 0) flows.push({ date: valuationDate, amount: currentValue });

    return {
      member,
      units: round(u, 6),
      ownershipPct: totalUnits > 0 ? u / totalUnits : 0,
      contributedBase: round(contributed, 2),
      withdrawnBase: round(withdrawn, 2),
      netInvestedBase: round(netInvested, 2),
      currentValueBase: round(currentValue, 2),
      profitBase: round(profit, 2),
      profitPct: netInvested > 0 ? profit / netInvested : 0,
      irr: xirr(flows),
      firstContribution: mine.sort((a, b) => (a.date < b.date ? -1 : 1))[0]?.date,
    };
  });

  memberStandings.sort((a, b) => b.currentValueBase - a.currentValueBase);

  return {
    settings,
    cash: { NGN: round(cash.NGN, 2), USD: round(cash.USD, 2) },
    cashBase: round(cashBase, 2),
    positions: finalPositions,
    closedTrades: closedTrades.sort((a, b) => (a.closedOn < b.closedOn ? 1 : -1)),
    totalUnits: round(totalUnits, 6),
    unitPrice: round(unitPrice, 6),
    navBase: round(navBase, 2),
    investedBase: round(investedBase, 2),
    contributedBase: round(contributedBase, 2),
    withdrawnBase: round(withdrawnBase, 2),
    netInvestedBase: round(netInvestedBase, 2),
    totalProfitBase: round(totalProfitBase, 2),
    totalProfitPct: netInvestedBase > 0 ? totalProfitBase / netInvestedBase : 0,
    realizedBase: round(realizedBase, 2),
    unrealizedBase: round(unrealizedBase, 2),
    feesBase: round(feesBase, 2),
    twr: settings.initialUnitPrice > 0 ? unitPrice / settings.initialUnitPrice - 1 : 0,
    members: memberStandings,
    navHistory,
    issuance,
    warnings: Array.from(new Set(warnings)),
  };
}

// ---------------------------------------------------------------------------
// XIRR — money-weighted annualised return over irregular cashflows.
// Bisection rather than Newton: slower, but it cannot diverge, and we are
// solving for a handful of flows a few times per render.
// ---------------------------------------------------------------------------

export function xirr(flows: { date: ISODate; amount: number }[]): number | null {
  if (flows.length < 2) return null;
  const hasNegative = flows.some((f) => f.amount < 0);
  const hasPositive = flows.some((f) => f.amount > 0);
  if (!hasNegative || !hasPositive) return null;

  const t0 = Date.parse(flows[0].date);
  const years = (d: ISODate) => (Date.parse(d) - t0) / (365.25 * 86_400_000);
  const npv = (rate: number) =>
    flows.reduce((s, f) => s + f.amount / Math.pow(1 + rate, years(f.date)), 0);

  let lo = -0.9999;
  let hi = 10;
  let fLo = npv(lo);
  let fHi = npv(hi);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (!Number.isFinite(fMid)) return null;
    if (fLo * fMid <= 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  const r = (lo + hi) / 2;
  return Number.isFinite(r) ? r : null;
}

// ---------------------------------------------------------------------------
// Monthly / cycle breakdown
// ---------------------------------------------------------------------------

export interface MonthlyRow {
  month: string; // "2026-02"
  label: string; // "Feb 2026"
  openUnitPrice: number;
  closeUnitPrice: number;
  returnPct: number;
  contributionsBase: number;
  withdrawalsBase: number;
  closeNavBase: number;
  tradeCount: number;
  realizedBase: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

export function monthlyBreakdown(data: FundData, state: FundState): MonthlyRow[] {
  if (!state.navHistory.length) return [];
  const base = data.settings.baseCurrency;

  const months = Array.from(
    new Set([
      ...state.navHistory.map((p) => p.date.slice(0, 7)),
      ...data.contributions.map((c) => c.date.slice(0, 7)),
      ...data.trades.map((t) => t.date.slice(0, 7)),
    ]),
  ).sort();

  const fxSeries = buildFxSeries(data);
  const fxAt = (c: Currency, d: ISODate) => {
    if (c === base) return 1;
    const series = fxSeries[c] ?? [];
    return asOf(series, d) ?? series[0]?.value ?? 1;
  };

  const rows: MonthlyRow[] = [];
  let previousClose = data.settings.initialUnitPrice;

  for (const month of months) {
    const inMonth = state.navHistory.filter((p) => p.date.slice(0, 7) === month);
    const closePoint = inMonth[inMonth.length - 1];
    const openUnitPrice = previousClose;
    const closeUnitPrice = closePoint ? closePoint.unitPrice : previousClose;

    const contributionsBase = data.contributions
      .filter((c) => c.date.slice(0, 7) === month)
      .reduce((s, c) => s + c.amount * (c.currency === base ? 1 : c.fxRate || fxAt(c.currency, c.date)), 0);
    const withdrawalsBase = data.withdrawals
      .filter((w) => w.date.slice(0, 7) === month)
      .reduce((s, w) => s + w.amount * (w.currency === base ? 1 : w.fxRate || fxAt(w.currency, w.date)), 0);

    rows.push({
      month,
      label: monthLabel(month),
      openUnitPrice,
      closeUnitPrice,
      returnPct: openUnitPrice > 0 ? closeUnitPrice / openUnitPrice - 1 : 0,
      contributionsBase,
      withdrawalsBase,
      closeNavBase: closePoint ? closePoint.navBase : 0,
      tradeCount: data.trades.filter((t) => t.date.slice(0, 7) === month).length,
      realizedBase: state.closedTrades
        .filter((t) => t.closedOn.slice(0, 7) === month)
        .reduce((s, t) => s + t.realizedBase, 0),
    });

    previousClose = closeUnitPrice;
  }

  return rows;
}
