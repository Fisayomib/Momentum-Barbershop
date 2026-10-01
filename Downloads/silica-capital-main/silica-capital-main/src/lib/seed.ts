import type { FundData } from "./types";

/**
 * Demo ledger so the app has something to show on first run. It is NOT real
 * Silica Capital data — Settings has a "Clear everything" button that wipes it.
 */
export const SEED: FundData = {
  settings: {
    fundName: "Silica Capital",
    baseCurrency: "NGN",
    initialUnitPrice: 100,
    inceptionDate: "2026-02-07",
  },
  members: [
    { id: "m1", name: "Fisayo", joinedAt: "2026-02-07", active: true },
    { id: "m2", name: "Tunde", joinedAt: "2026-02-07", active: true },
    { id: "m3", name: "Chidi", joinedAt: "2026-02-07", active: true },
    { id: "m4", name: "Amara", joinedAt: "2026-03-05", active: true },
    { id: "m5", name: "Kelechi", joinedAt: "2026-04-04", active: true },
  ],
  contributions: [
    { id: "c1", memberId: "m1", date: "2026-02-07", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c2", memberId: "m2", date: "2026-02-07", amount: 100_000, currency: "NGN", fxRate: 1 },
    { id: "c3", memberId: "m3", date: "2026-02-07", amount: 200_000, currency: "NGN", fxRate: 1 },

    { id: "c4", memberId: "m1", date: "2026-03-05", amount: 120_000, currency: "NGN", fxRate: 1 },
    { id: "c5", memberId: "m2", date: "2026-03-05", amount: 100_000, currency: "NGN", fxRate: 1 },
    { id: "c6", memberId: "m3", date: "2026-03-05", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c7", memberId: "m4", date: "2026-03-05", amount: 250_000, currency: "NGN", fxRate: 1 },

    { id: "c8", memberId: "m1", date: "2026-04-04", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c9", memberId: "m2", date: "2026-04-04", amount: 80_000, currency: "NGN", fxRate: 1 },
    { id: "c10", memberId: "m3", date: "2026-04-04", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c11", memberId: "m4", date: "2026-04-04", amount: 200_000, currency: "NGN", fxRate: 1 },
    { id: "c12", memberId: "m5", date: "2026-04-04", amount: 300_000, currency: "NGN", fxRate: 1 },

    { id: "c13", memberId: "m1", date: "2026-05-06", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c14", memberId: "m3", date: "2026-05-06", amount: 180_000, currency: "NGN", fxRate: 1 },
    { id: "c15", memberId: "m5", date: "2026-05-06", amount: 250_000, currency: "NGN", fxRate: 1 },

    { id: "c16", memberId: "m1", date: "2026-06-05", amount: 200_000, currency: "NGN", fxRate: 1 },
    { id: "c17", memberId: "m2", date: "2026-06-05", amount: 120_000, currency: "NGN", fxRate: 1 },
    { id: "c18", memberId: "m4", date: "2026-06-05", amount: 220_000, currency: "NGN", fxRate: 1 },
    { id: "c19", memberId: "m5", date: "2026-06-05", amount: 200_000, currency: "NGN", fxRate: 1 },

    { id: "c20", memberId: "m1", date: "2026-07-06", amount: 180_000, currency: "NGN", fxRate: 1 },
    { id: "c21", memberId: "m2", date: "2026-07-06", amount: 150_000, currency: "NGN", fxRate: 1 },
    { id: "c22", memberId: "m3", date: "2026-07-06", amount: 200_000, currency: "NGN", fxRate: 1 },
    { id: "c23", memberId: "m5", date: "2026-07-06", amount: 250_000, currency: "NGN", fxRate: 1 },
  ],
  withdrawals: [],
  trades: [
    {
      id: "t1", date: "2026-02-10", symbol: "GTCO", name: "Guaranty Trust Holding",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 3000, price: 57.5, fees: 1_725, fxRate: 1,
      thesis: "Cheap on book value, strong 2025 earnings, banking recapitalisation tailwind.",
    },
    {
      id: "t2", date: "2026-02-12", symbol: "ARADEL", name: "Aradel Holdings",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 250, price: 620, fees: 1_550, fxRate: 1,
      thesis: "Oil producer with rising output; hedge against naira weakness.",
    },
    {
      id: "t3", date: "2026-03-09", symbol: "MTNN", name: "MTN Nigeria",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 900, price: 232, fees: 2_088, fxRate: 1,
      thesis: "Tariff hike flowing into margins; balance sheet repaired after FX losses.",
    },
    {
      id: "t4", date: "2026-03-16", symbol: "NVDA", name: "NVIDIA Corp",
      market: "US", currency: "USD", side: "BUY", quantity: 2, price: 138.4, fees: 2, fxRate: 1_545,
      thesis: "Core AI infrastructure holding — our one high-conviction US position.",
    },
    {
      id: "t5", date: "2026-04-08", symbol: "ZENITHBANK", name: "Zenith Bank",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 4000, price: 46.2, fees: 1_848, fxRate: 1,
      thesis: "Highest dividend yield in tier-1 banking, trading under 3x earnings.",
    },
    {
      id: "t6", date: "2026-04-20", symbol: "GTCO", market: "NGX", currency: "NGN",
      side: "SELL", quantity: 1500, price: 71.8, fees: 1_615, fxRate: 1,
      thesis: "Took half off after a 25% run — rebalancing, not exiting.",
    },
    {
      id: "t7", date: "2026-05-11", symbol: "AAPL", name: "Apple Inc",
      market: "US", currency: "USD", side: "BUY", quantity: 2, price: 221.5, fees: 2, fxRate: 1_572,
      thesis: "Defensive US exposure, buyback support.",
    },
    {
      id: "t8", date: "2026-05-26", symbol: "DANGCEM", name: "Dangote Cement",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 500, price: 512, fees: 2_560, fxRate: 1,
      thesis: "Infrastructure spending cycle plus pan-African volume recovery.",
    },
    {
      id: "t9", date: "2026-06-15", symbol: "ARADEL", market: "NGX", currency: "NGN",
      side: "SELL", quantity: 250, price: 548, fees: 1_370, fxRate: 1,
      thesis: "Thesis broke — production guidance cut. Cut it rather than average down.",
    },
    {
      id: "t10", date: "2026-06-22", symbol: "NVDA", market: "US", currency: "USD",
      side: "BUY", quantity: 1, price: 152.9, fees: 2, fxRate: 1_601,
      thesis: "Added on strength after the datacentre print.",
    },
    {
      id: "t11", date: "2026-07-13", symbol: "SEPLAT", name: "Seplat Energy",
      market: "NGX", currency: "NGN", side: "BUY", quantity: 300, price: 5_450, fees: 8_175, fxRate: 1,
      thesis: "Replacing Aradel with the better-run operator in the same theme.",
    },
  ],
  priceMarks: [
    { id: "p1", symbol: "GTCO", date: "2026-08-01", price: 74.9, currency: "NGN" },
    { id: "p2", symbol: "MTNN", date: "2026-08-01", price: 268, currency: "NGN" },
    { id: "p3", symbol: "ZENITHBANK", date: "2026-08-01", price: 49.8, currency: "NGN" },
    { id: "p4", symbol: "DANGCEM", date: "2026-08-01", price: 494, currency: "NGN" },
    { id: "p5", symbol: "SEPLAT", date: "2026-08-01", price: 5_820, currency: "NGN" },
    { id: "p6", symbol: "NVDA", date: "2026-08-01", price: 168.2, currency: "USD" },
    { id: "p7", symbol: "AAPL", date: "2026-08-01", price: 214.9, currency: "USD" },
    // Month-end marks, so each cycle has a real return rather than a flat line.
    // Only symbols actually held at that date are marked.
    { id: "p20", symbol: "GTCO", date: "2026-02-27", price: 60.2, currency: "NGN" },
    { id: "p21", symbol: "ARADEL", date: "2026-02-27", price: 605, currency: "NGN" },

    { id: "p22", symbol: "GTCO", date: "2026-03-31", price: 64.5, currency: "NGN" },
    { id: "p23", symbol: "ARADEL", date: "2026-03-31", price: 590, currency: "NGN" },
    { id: "p24", symbol: "MTNN", date: "2026-03-31", price: 240, currency: "NGN" },
    { id: "p25", symbol: "NVDA", date: "2026-03-31", price: 141.2, currency: "USD" },

    { id: "p8", symbol: "GTCO", date: "2026-04-30", price: 70.1, currency: "NGN" },
    { id: "p9", symbol: "MTNN", date: "2026-04-30", price: 241, currency: "NGN" },
    { id: "p10", symbol: "NVDA", date: "2026-04-30", price: 144.6, currency: "USD" },
    { id: "p26", symbol: "ARADEL", date: "2026-04-30", price: 572, currency: "NGN" },
    { id: "p27", symbol: "ZENITHBANK", date: "2026-04-30", price: 46.9, currency: "NGN" },

    { id: "p28", symbol: "GTCO", date: "2026-05-29", price: 72.0, currency: "NGN" },
    { id: "p29", symbol: "MTNN", date: "2026-05-29", price: 252, currency: "NGN" },
    { id: "p30", symbol: "ZENITHBANK", date: "2026-05-29", price: 47.0, currency: "NGN" },
    { id: "p31", symbol: "ARADEL", date: "2026-05-29", price: 556, currency: "NGN" },
    { id: "p32", symbol: "DANGCEM", date: "2026-05-29", price: 508, currency: "NGN" },
    { id: "p33", symbol: "NVDA", date: "2026-05-29", price: 149.8, currency: "USD" },
    { id: "p34", symbol: "AAPL", date: "2026-05-29", price: 218.4, currency: "USD" },

    { id: "p11", symbol: "GTCO", date: "2026-06-30", price: 73.2, currency: "NGN" },
    { id: "p12", symbol: "MTNN", date: "2026-06-30", price: 259, currency: "NGN" },
    { id: "p13", symbol: "NVDA", date: "2026-06-30", price: 159.4, currency: "USD" },
    { id: "p14", symbol: "AAPL", date: "2026-06-30", price: 208.3, currency: "USD" },
    { id: "p15", symbol: "ZENITHBANK", date: "2026-06-30", price: 47.5, currency: "NGN" },
    { id: "p16", symbol: "DANGCEM", date: "2026-06-30", price: 505, currency: "NGN" },

    { id: "p35", symbol: "GTCO", date: "2026-07-31", price: 74.2, currency: "NGN" },
    { id: "p36", symbol: "MTNN", date: "2026-07-31", price: 265, currency: "NGN" },
    { id: "p37", symbol: "ZENITHBANK", date: "2026-07-31", price: 49.2, currency: "NGN" },
    { id: "p38", symbol: "DANGCEM", date: "2026-07-31", price: 498, currency: "NGN" },
    { id: "p39", symbol: "SEPLAT", date: "2026-07-31", price: 5_700, currency: "NGN" },
    { id: "p40", symbol: "NVDA", date: "2026-07-31", price: 165.0, currency: "USD" },
    { id: "p41", symbol: "AAPL", date: "2026-07-31", price: 212.0, currency: "USD" },
  ],
  fxMarks: [
    { id: "f1", currency: "USD", date: "2026-02-07", rate: 1_530 },
    { id: "f5", currency: "USD", date: "2026-03-31", rate: 1_550 },
    { id: "f2", currency: "USD", date: "2026-04-30", rate: 1_558 },
    { id: "f6", currency: "USD", date: "2026-05-29", rate: 1_585 },
    { id: "f3", currency: "USD", date: "2026-06-30", rate: 1_604 },
    { id: "f7", currency: "USD", date: "2026-07-31", rate: 1_612 },
    { id: "f4", currency: "USD", date: "2026-08-01", rate: 1_618 },
  ],
};

export const EMPTY: FundData = {
  settings: {
    fundName: "Silica Capital",
    baseCurrency: "NGN",
    initialUnitPrice: 100,
    inceptionDate: new Date().toISOString().slice(0, 10),
  },
  members: [],
  contributions: [],
  withdrawals: [],
  trades: [],
  priceMarks: [],
  fxMarks: [],
};
