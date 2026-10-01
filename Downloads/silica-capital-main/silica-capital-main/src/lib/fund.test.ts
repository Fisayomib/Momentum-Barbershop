/**
 * Engine checks. Run with:  npm test
 *
 * These exist because the unit maths is the one thing in this app that is not
 * self-evidently right, and getting it wrong silently transfers money between
 * real people.
 */
import assert from "node:assert/strict";
import test from "node:test";
// Explicit .ts extensions: this file runs under `node --experimental-strip-types`,
// whose ESM resolver does not guess extensions the way the bundler does.
import { computeFund, xirr } from "./fund.ts";
import { SEED } from "./seed.ts";
import type { FundData } from "./types.ts";

const blank = (): FundData => ({
  settings: {
    fundName: "Test",
    baseCurrency: "NGN",
    initialUnitPrice: 100,
    inceptionDate: "2026-01-01",
  },
  members: [
    { id: "a", name: "A", joinedAt: "2026-01-01", active: true },
    { id: "b", name: "B", joinedAt: "2026-01-01", active: true },
  ],
  contributions: [],
  withdrawals: [],
  trades: [],
  priceMarks: [],
  fxMarks: [],
});

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ~${expected}, got ${actual}`,
  );

test("a late contributor does not share in gains earned before they joined", () => {
  const d = blank();
  // A puts in 100k on day one and the fund buys 1,000 shares at 100.
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "XYZ", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  // The stock doubles.
  d.priceMarks.push({ id: "p1", symbol: "XYZ", date: "2026-02-01", price: 200, currency: "NGN" });
  // Only then does B put in the same 100k.
  d.contributions.push({
    id: "c2", memberId: "b", date: "2026-02-02", amount: 100_000, currency: "NGN", fxRate: 1,
  });

  const s = computeFund(d, "2026-02-03");

  near(s.navBase, 300_000);

  const a = s.members.find((m) => m.member.id === "a")!;
  const b = s.members.find((m) => m.member.id === "b")!;

  // A earned the whole 100k gain; B just arrived and is flat.
  near(a.currentValueBase, 200_000);
  near(a.profitBase, 100_000);
  near(b.currentValueBase, 100_000);
  near(b.profitBase, 0);

  // The naive "share of total contributions" split would have given both
  // 150,000 — quietly moving 50,000 from A to B.
  assert.notEqual(Math.round(a.currentValueBase), 150_000);
});

test("equal money on the same day splits exactly in half", () => {
  const d = blank();
  d.contributions.push(
    { id: "c1", memberId: "a", date: "2026-01-01", amount: 50_000, currency: "NGN", fxRate: 1 },
    { id: "c2", memberId: "b", date: "2026-01-01", amount: 50_000, currency: "NGN", fxRate: 1 },
  );
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "XYZ", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  d.priceMarks.push({ id: "p1", symbol: "XYZ", date: "2026-02-01", price: 150, currency: "NGN" });

  const s = computeFund(d, "2026-02-01");
  const a = s.members.find((m) => m.member.id === "a")!;
  const b = s.members.find((m) => m.member.id === "b")!;

  near(a.ownershipPct, 0.5, 1e-6);
  near(a.currentValueBase, b.currentValueBase);
  near(a.currentValueBase, 75_000);
});

test("member stakes always add up to the fund value", () => {
  const d = blank();
  d.contributions.push(
    { id: "c1", memberId: "a", date: "2026-01-01", amount: 120_000, currency: "NGN", fxRate: 1 },
    { id: "c2", memberId: "b", date: "2026-03-01", amount: 80_000, currency: "NGN", fxRate: 1 },
    { id: "c3", memberId: "a", date: "2026-04-01", amount: 45_000, currency: "NGN", fxRate: 1 },
  );
  d.trades.push(
    { id: "t1", date: "2026-01-05", symbol: "AAA", market: "NGX", currency: "NGN",
      side: "BUY", quantity: 500, price: 200, fees: 500, fxRate: 1 },
    { id: "t2", date: "2026-05-01", symbol: "AAA", market: "NGX", currency: "NGN",
      side: "SELL", quantity: 200, price: 260, fees: 400, fxRate: 1 },
  );
  d.priceMarks.push({ id: "p1", symbol: "AAA", date: "2026-06-01", price: 245, currency: "NGN" });

  const s = computeFund(d, "2026-06-01");
  const sum = s.members.reduce((acc, m) => acc + m.currentValueBase, 0);
  near(sum, s.navBase, 0.5);
});

test("realised profit uses average cost and books the gain once", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 500_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push(
    // 100 @ 100 then 100 @ 200 -> average cost 150
    { id: "t1", date: "2026-01-02", symbol: "AAA", market: "NGX", currency: "NGN",
      side: "BUY", quantity: 100, price: 100, fees: 0, fxRate: 1 },
    { id: "t2", date: "2026-01-03", symbol: "AAA", market: "NGX", currency: "NGN",
      side: "BUY", quantity: 100, price: 200, fees: 0, fxRate: 1 },
    // sell half at 250 -> (250 - 150) * 100 = 10,000
    { id: "t3", date: "2026-01-04", symbol: "AAA", market: "NGX", currency: "NGN",
      side: "SELL", quantity: 100, price: 250, fees: 0, fxRate: 1 },
  );

  const s = computeFund(d, "2026-01-05");
  near(s.realizedBase, 10_000);
  const pos = s.positions.find((p) => p.symbol === "AAA")!;
  near(pos.avgCostNative, 150);
  near(pos.quantity, 100);
});

test("buying in dollars converts out of the naira pool, not into negative cash", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 1_600_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "NVDA", market: "US", currency: "USD",
    side: "BUY", quantity: 10, price: 100, fees: 0, fxRate: 1_600,
  });

  const s = computeFund(d, "2026-01-03");
  // 10 x $100 x 1600 = 1,600,000 naira spent, leaving nothing.
  near(s.cash.NGN, 0);
  near(s.cash.USD, 0);
  near(s.navBase, 1_600_000);
});

test("fx movement alone shows up as profit on a dollar holding", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 1_600_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "NVDA", market: "US", currency: "USD",
    side: "BUY", quantity: 10, price: 100, fees: 0, fxRate: 1_600,
  });
  // Share price flat, naira weakens 1600 -> 1800.
  d.priceMarks.push({ id: "p1", symbol: "NVDA", date: "2026-03-01", price: 100, currency: "USD" });
  d.fxMarks.push({ id: "f1", currency: "USD", date: "2026-03-01", rate: 1_800 });

  const s = computeFund(d, "2026-03-01");
  near(s.navBase, 1_800_000);
  near(s.totalProfitBase, 200_000);
  const pos = s.positions[0];
  near(pos.unrealizedNative, 0); // flat in dollars
  near(pos.unrealizedBase, 200_000); // up in naira
  // The headline percentage must agree with the headline money figure.
  near(pos.unrealizedPctNative, 0, 1e-6);
  near(pos.unrealizedPct, 0.125, 1e-6); // 200k on 1.6m of naira cost
});

test("withdrawal burns units at the current price and leaves others untouched", () => {
  const d = blank();
  d.contributions.push(
    { id: "c1", memberId: "a", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1 },
    { id: "c2", memberId: "b", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1 },
  );
  // Invest the whole 200k pool so there is no idle cash diluting the maths.
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "AAA", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 2000, price: 100, fees: 0, fxRate: 1,
  });
  d.priceMarks.push({ id: "p1", symbol: "AAA", date: "2026-02-01", price: 150, currency: "NGN" });
  // Fund is now 300k; each stake is 150k. A takes out 50k.
  d.withdrawals.push({
    id: "w1", memberId: "a", date: "2026-02-02", amount: 50_000, currency: "NGN", fxRate: 1,
  });

  const s = computeFund(d, "2026-02-03");
  const a = s.members.find((m) => m.member.id === "a")!;
  const b = s.members.find((m) => m.member.id === "b")!;

  near(a.currentValueBase, 100_000);
  near(b.currentValueBase, 150_000); // B is completely unaffected
  near(s.navBase, 250_000);
});

test("uninvested cash dilutes the gain, because it is part of the fund", () => {
  const d = blank();
  d.contributions.push(
    { id: "c1", memberId: "a", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1 },
    { id: "c2", memberId: "b", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1 },
  );
  // Only half the pool goes to work.
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "AAA", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  d.priceMarks.push({ id: "p1", symbol: "AAA", date: "2026-02-01", price: 150, currency: "NGN" });

  const s = computeFund(d, "2026-02-01");
  // 100k cash + 150k stock = 250k, not 300k — the idle half earned nothing.
  near(s.navBase, 250_000);
  near(s.unitPrice, 125);
  near(s.twr, 0.25, 1e-6);
  for (const m of s.members) near(m.currentValueBase, 125_000);
});

test("paying someone out with no cash on hand is flagged", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "AAA", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  d.withdrawals.push({
    id: "w1", memberId: "a", date: "2026-01-03", amount: 50_000, currency: "NGN", fxRate: 1,
  });

  const s = computeFund(d, "2026-01-04");
  assert.ok(
    s.warnings.some((w) => w.toLowerCase().includes("cash")),
    `expected a cash warning, got: ${JSON.stringify(s.warnings)}`,
  );
});

test("unit price is the time-weighted return, immune to contribution timing", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 100_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "AAA", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  d.priceMarks.push({ id: "p1", symbol: "AAA", date: "2026-02-01", price: 120, currency: "NGN" });

  const before = computeFund(d, "2026-02-02");
  near(before.twr, 0.2, 1e-6);

  // Pouring in a large contribution must not change the performance figure.
  d.contributions.push({
    id: "c2", memberId: "b", date: "2026-02-02", amount: 5_000_000, currency: "NGN", fxRate: 1,
  });
  const after = computeFund(d, "2026-02-03");
  near(after.twr, 0.2, 1e-6);
  assert.ok(after.navBase > before.navBase, "fund value should still grow");
});

test("xirr recovers a known annual return", () => {
  const r = xirr([
    { date: "2026-01-01", amount: -1000 },
    { date: "2027-01-01", amount: 1100 },
  ]);
  assert.ok(r !== null);
  near(r!, 0.1, 0.005);
});

test("a later price is never back-dated onto an earlier month", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-02-01", amount: 100_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-02-02", symbol: "AAA", market: "NGX", currency: "NGN",
    side: "BUY", quantity: 1000, price: 100, fees: 0, fxRate: 1,
  });
  // The only price we ever record is in April, well above cost.
  d.priceMarks.push({ id: "p1", symbol: "AAA", date: "2026-04-30", price: 130, currency: "NGN" });

  // In February nothing had happened yet, so the fund is worth exactly its cost.
  const feb = computeFund(d, "2026-02-15");
  near(feb.navBase, 100_000);
  near(feb.unitPrice, 100);
  near(feb.twr, 0, 1e-9);

  // The gain belongs to April, where it was actually observed.
  const apr = computeFund(d, "2026-04-30");
  near(apr.navBase, 130_000);
  near(apr.twr, 0.3, 1e-6);
});

test("fx falls back to the earliest known rate rather than 1", () => {
  const d = blank();
  d.contributions.push({
    id: "c1", memberId: "a", date: "2026-01-01", amount: 1_600_000, currency: "NGN", fxRate: 1,
  });
  d.trades.push({
    id: "t1", date: "2026-01-02", symbol: "NVDA", market: "US", currency: "USD",
    side: "BUY", quantity: 10, price: 100, fees: 0, fxRate: 1_600,
  });
  d.priceMarks.push({ id: "p1", symbol: "NVDA", date: "2026-01-03", price: 100, currency: "USD" });

  // Valuing before any FX mark must not treat $1 as ₦1.
  const s = computeFund(d, "2026-01-03");
  near(s.navBase, 1_600_000);
});

test("the demo ledger is internally consistent", () => {
  // The demo is the first thing anyone sees. If it spends money the group never
  // contributed, it teaches the wrong thing and looks broken.
  const s = computeFund(SEED, "2026-08-03");

  assert.ok(s.cash.NGN >= 0, `demo overdraws naira cash: ${s.cash.NGN}`);
  assert.ok(s.cash.USD >= 0, `demo overdraws dollar cash: ${s.cash.USD}`);
  assert.ok(
    !s.warnings.some((w) => w.includes("overdrawn")),
    `demo raises an overdraft warning: ${JSON.stringify(s.warnings)}`,
  );

  const sum = s.members.reduce((acc, m) => acc + m.currentValueBase, 0);
  near(sum, s.navBase, 1);
});

test("an empty ledger does not explode", () => {
  const s = computeFund(blank(), "2026-01-01");
  assert.equal(s.navBase, 0);
  assert.equal(s.totalUnits, 0);
  assert.equal(s.unitPrice, 100);
  assert.deepEqual(s.positions, []);
});
