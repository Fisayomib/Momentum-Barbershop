import type { FundData } from "../types";

/**
 * Storage is behind this interface so the app can run against browser storage
 * (zero setup) or Supabase (shared across the group) without any page knowing
 * which one it is.
 */
export interface Adapter {
  readonly kind: "local" | "supabase";
  load(): Promise<FundData>;
  save(data: FundData): Promise<void>;
}
