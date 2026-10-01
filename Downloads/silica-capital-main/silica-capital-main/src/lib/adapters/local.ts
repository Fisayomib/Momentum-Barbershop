import type { FundData } from "../types";
import { SEED } from "../seed";
import type { Adapter } from "./types";

const KEY = "silica-capital:v1";

export const localAdapter: Adapter = {
  kind: "local",

  async load(): Promise<FundData> {
    if (typeof window === "undefined") return SEED;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return SEED;
      const parsed = JSON.parse(raw) as Partial<FundData>;
      // Merge against SEED's shape so a ledger saved by an older build (missing
      // a newer array) still loads instead of crashing on undefined.
      return {
        settings: { ...SEED.settings, ...parsed.settings },
        members: parsed.members ?? [],
        contributions: parsed.contributions ?? [],
        withdrawals: parsed.withdrawals ?? [],
        trades: parsed.trades ?? [],
        priceMarks: parsed.priceMarks ?? [],
        fxMarks: parsed.fxMarks ?? [],
      };
    } catch {
      return SEED;
    }
  },

  async save(data: FundData): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  },
};
