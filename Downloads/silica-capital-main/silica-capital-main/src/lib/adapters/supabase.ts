import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FundData } from "../types";
import { EMPTY } from "../seed";
import type { Adapter } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(URL && ANON);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  client ??= createClient(URL!, ANON!);
  return client;
}

// --- row <-> domain mapping -------------------------------------------------
// Postgres is snake_case, the app is camelCase. These keep that seam in one place.

const toRow = {
  member: (m: FundData["members"][number]) => ({
    id: m.id, name: m.name, email: m.email ?? null,
    joined_at: m.joinedAt, active: m.active, color: m.color ?? null,
  }),
  contribution: (c: FundData["contributions"][number]) => ({
    id: c.id, member_id: c.memberId, date: c.date, amount: c.amount,
    currency: c.currency, fx_rate: c.fxRate, note: c.note ?? null,
  }),
  withdrawal: (w: FundData["withdrawals"][number]) => ({
    id: w.id, member_id: w.memberId, date: w.date, amount: w.amount,
    currency: w.currency, fx_rate: w.fxRate, note: w.note ?? null,
  }),
  trade: (t: FundData["trades"][number]) => ({
    id: t.id, date: t.date, symbol: t.symbol, name: t.name ?? null, market: t.market,
    currency: t.currency, side: t.side, quantity: t.quantity, price: t.price,
    fees: t.fees, fx_rate: t.fxRate, thesis: t.thesis ?? null, note: t.note ?? null,
  }),
  priceMark: (p: FundData["priceMarks"][number]) => ({
    id: p.id, symbol: p.symbol, date: p.date, price: p.price, currency: p.currency,
  }),
  fxMark: (f: FundData["fxMarks"][number]) => ({
    id: f.id, currency: f.currency, date: f.date, rate: f.rate,
  }),
};

const fromRow = {
  member: (r: any): FundData["members"][number] => ({
    id: r.id, name: r.name, email: r.email ?? undefined,
    joinedAt: r.joined_at, active: r.active, color: r.color ?? undefined,
  }),
  contribution: (r: any): FundData["contributions"][number] => ({
    id: r.id, memberId: r.member_id, date: r.date, amount: Number(r.amount),
    currency: r.currency, fxRate: Number(r.fx_rate), note: r.note ?? undefined,
  }),
  withdrawal: (r: any): FundData["withdrawals"][number] => ({
    id: r.id, memberId: r.member_id, date: r.date, amount: Number(r.amount),
    currency: r.currency, fxRate: Number(r.fx_rate), note: r.note ?? undefined,
  }),
  trade: (r: any): FundData["trades"][number] => ({
    id: r.id, date: r.date, symbol: r.symbol, name: r.name ?? undefined, market: r.market,
    currency: r.currency, side: r.side, quantity: Number(r.quantity), price: Number(r.price),
    fees: Number(r.fees), fxRate: Number(r.fx_rate),
    thesis: r.thesis ?? undefined, note: r.note ?? undefined,
  }),
  priceMark: (r: any): FundData["priceMarks"][number] => ({
    id: r.id, symbol: r.symbol, date: r.date, price: Number(r.price), currency: r.currency,
  }),
  fxMark: (r: any): FundData["fxMarks"][number] => ({
    id: r.id, currency: r.currency, date: r.date, rate: Number(r.rate),
  }),
};

const TABLES = [
  ["sc_members", "members", toRow.member, fromRow.member],
  ["sc_contributions", "contributions", toRow.contribution, fromRow.contribution],
  ["sc_withdrawals", "withdrawals", toRow.withdrawal, fromRow.withdrawal],
  ["sc_trades", "trades", toRow.trade, fromRow.trade],
  ["sc_price_marks", "priceMarks", toRow.priceMark, fromRow.priceMark],
  ["sc_fx_marks", "fxMarks", toRow.fxMark, fromRow.fxMark],
] as const;

export const supabaseAdapter: Adapter = {
  kind: "supabase",

  async load(): Promise<FundData> {
    const sb = getSupabase();
    if (!sb) return EMPTY;

    const data: FundData = { ...EMPTY, members: [], contributions: [], withdrawals: [], trades: [], priceMarks: [], fxMarks: [] };

    const settingsRes = await sb.from("sc_settings").select("*").eq("id", 1).maybeSingle();
    if (settingsRes.data) {
      data.settings = {
        fundName: settingsRes.data.fund_name,
        baseCurrency: settingsRes.data.base_currency,
        initialUnitPrice: Number(settingsRes.data.initial_unit_price),
        inceptionDate: settingsRes.data.inception_date,
      };
    }

    for (const [table, key, , map] of TABLES) {
      const { data: rows, error } = await sb.from(table).select("*");
      if (error) throw new Error(`Loading ${table}: ${error.message}`);
      (data as any)[key] = (rows ?? []).map((row) => (map as (r: any) => unknown)(row));
    }

    return data;
  },

  async save(data: FundData): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;

    const s = data.settings;
    const settingsRes = await sb.from("sc_settings").upsert({
      id: 1,
      fund_name: s.fundName,
      base_currency: s.baseCurrency,
      initial_unit_price: s.initialUnitPrice,
      inception_date: s.inceptionDate,
    });
    if (settingsRes.error) throw new Error(`Saving settings: ${settingsRes.error.message}`);

    for (const [table, key, map] of TABLES) {
      const items = (data as any)[key] as any[];
      const rows = items.map(map as (x: any) => any);

      if (rows.length) {
        const { error } = await sb.from(table).upsert(rows);
        if (error) throw new Error(`Saving ${table}: ${error.message}`);
      }

      // Drop anything the client no longer has. `not in ()` is invalid SQL, so
      // an empty ledger deletes everything instead.
      const ids = rows.map((r) => r.id);
      const del = ids.length
        ? sb.from(table).delete().not("id", "in", `(${ids.map((i) => `"${i}"`).join(",")})`)
        : sb.from(table).delete().neq("id", "__none__");
      const { error } = await del;
      if (error) throw new Error(`Pruning ${table}: ${error.message}`);
    }
  },
};
