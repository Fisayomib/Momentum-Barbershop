export type Currency = "NGN" | "USD";

export type Market = "NGX" | "US" | "OTHER";

export type Side = "BUY" | "SELL";

/** ISO date, always "YYYY-MM-DD" so lexicographic sort === chronological sort. */
export type ISODate = string;

export interface Settings {
  fundName: string;
  /** Everything ultimately rolls up to this currency. */
  baseCurrency: Currency;
  /**
   * Price of one unit on day zero. Purely cosmetic — it sets the scale of the
   * unit ledger. 100 means a 100,000 contribution on day one buys 1,000 units.
   */
  initialUnitPrice: number;
  inceptionDate: ISODate;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  joinedAt: ISODate;
  active: boolean;
  /** Optional hex colour for charts; auto-assigned if absent. */
  color?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  date: ISODate;
  amount: number;
  currency: Currency;
  /** Value of 1 unit of `currency` in base currency at the time. 1 when currency === base. */
  fxRate: number;
  note?: string;
}

export interface Withdrawal {
  id: string;
  memberId: string;
  date: ISODate;
  amount: number;
  currency: Currency;
  fxRate: number;
  note?: string;
}

export interface Trade {
  id: string;
  date: ISODate;
  symbol: string;
  name?: string;
  market: Market;
  /** Currency the stock trades in. */
  currency: Currency;
  side: Side;
  quantity: number;
  /** Price per share, in `currency`. */
  price: number;
  /** Commission / stamp duty / SEC fees etc, in `currency`. */
  fees: number;
  /** Value of 1 unit of `currency` in base currency on the trade date. */
  fxRate: number;
  /** Free-text: why we took this trade. Drives the "what our trades mean" view. */
  thesis?: string;
  note?: string;
}

/** A recorded market price for a symbol on a date. Latest mark <= a date is used to value it. */
export interface PriceMark {
  id: string;
  symbol: string;
  date: ISODate;
  price: number;
  currency: Currency;
}

/** A recorded FX rate: 1 `currency` = `rate` base currency, on `date`. */
export interface FxMark {
  id: string;
  currency: Currency;
  date: ISODate;
  rate: number;
}

export interface FundData {
  settings: Settings;
  members: Member[];
  contributions: Contribution[];
  withdrawals: Withdrawal[];
  trades: Trade[];
  priceMarks: PriceMark[];
  fxMarks: FxMark[];
}

// ---------------------------------------------------------------------------
// Derived / computed shapes (never stored — always recomputed from the ledger)
// ---------------------------------------------------------------------------

export interface Position {
  symbol: string;
  name?: string;
  market: Market;
  currency: Currency;
  quantity: number;
  /** Total cost incl. fees, in the position's own currency. */
  costNative: number;
  /** Total cost incl. fees, converted to base at the FX rate paid on each buy. */
  costBase: number;
  avgCostNative: number;
  /** Latest known mark, or avg cost if we've never marked it. */
  lastPriceNative: number;
  /** True when we fell back to cost because no price mark exists yet. */
  priceIsStale: boolean;
  lastPriceDate?: ISODate;
  marketValueNative: number;
  marketValueBase: number;
  unrealizedNative: number;
  unrealizedBase: number;
  /**
   * Base-currency return, so it always agrees with `unrealizedBase`. For a
   * foreign holding this bundles the share move and the FX move together —
   * which is the number that actually matters to the group's naira.
   */
  unrealizedPct: number;
  /** Share-price move alone, in the stock's own currency. Equals unrealizedPct for domestic holdings. */
  unrealizedPctNative: number;
}

export interface ClosedTrade {
  symbol: string;
  currency: Currency;
  quantity: number;
  openedOn?: ISODate;
  closedOn: ISODate;
  proceedsNative: number;
  costNative: number;
  realizedNative: number;
  realizedBase: number;
  realizedPct: number;
  holdingDays?: number;
  thesis?: string;
}

export interface MemberStanding {
  member: Member;
  units: number;
  ownershipPct: number;
  contributedBase: number;
  withdrawnBase: number;
  /** contributed - withdrawn */
  netInvestedBase: number;
  currentValueBase: number;
  /** currentValue - netInvested */
  profitBase: number;
  profitPct: number;
  /** Money-weighted annualised return for this member, null when not computable. */
  irr: number | null;
  firstContribution?: ISODate;
}

export interface NavPoint {
  date: ISODate;
  navBase: number;
  totalUnits: number;
  unitPrice: number;
}

export interface FundState {
  settings: Settings;
  /** Uninvested cash, per currency. */
  cash: Record<Currency, number>;
  cashBase: number;
  positions: Position[];
  closedTrades: ClosedTrade[];
  totalUnits: number;
  unitPrice: number;
  /** Cash + market value of all positions, in base currency. */
  navBase: number;
  investedBase: number;
  contributedBase: number;
  withdrawnBase: number;
  netInvestedBase: number;
  totalProfitBase: number;
  totalProfitPct: number;
  realizedBase: number;
  unrealizedBase: number;
  feesBase: number;
  /** Total return since inception, time-weighted (unitPrice / initialUnitPrice - 1). */
  twr: number;
  members: MemberStanding[];
  navHistory: NavPoint[];
  /** Per contribution id: what it bought, at what price. Keyed for the ledger view. */
  issuance: Record<string, { units: number; unitPrice: number; amountBase: number }>;
  /** Non-fatal data problems worth showing the user. */
  warnings: string[];
}
