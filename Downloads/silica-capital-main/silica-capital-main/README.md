# Silica Capital

A ledger for a group investment club: everyone contributes what they want each
month, the pool buys stocks, and the app works out what each person's share is
actually worth.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. It starts with demo data so you can click around —
**Settings → Clear everything** wipes it when you're ready for real numbers.

```bash
npm test           # the fund maths
npm run build      # production build
npm run build:check # verify it compiles WITHOUT stopping a running dev server
```

**Don't run `npm run build` while `npm run dev` is running.** They both write to
`.next`, so the build deletes the files the dev server is still serving. The
browser then hangs on "Loading the ledger…" with a `ChunkLoadError` in the
console, and stays broken until you restart dev. If it happens: stop the dev
server, delete `.next`, start it again. Use `npm run build:check` instead — it
builds into a scratch directory and leaves the dev server alone.

## The one idea that matters

Splitting profit by "share of total money contributed" is wrong, and it's the
mistake almost every informal group makes.

Say Tunde put in ₦100k in February and Kelechi put in ₦100k in June. Same
amount, so a naive split gives them equal shares. But Tunde's money was working
for four extra months. If the fund grew 20% over that stretch, the naive split
hands Kelechi a slice of gains he wasn't there for — paid for out of Tunde's
pocket. Nobody notices, because the spreadsheet still balances.

So this app **unitises** the fund, the same way a mutual fund does:

```
unit price = fund value ÷ units outstanding
```

Every contribution buys units at the unit price **on the day it lands**. If the
fund has grown since inception, later money buys fewer units for the same naira.
Your stake is just `your units × today's unit price`. Contributions only ever
create units; withdrawals destroy them. Trading gains move the *price*, which
lifts everyone in proportion to how long their money has actually been at risk.

It's fair by construction rather than by anyone remembering to adjust for it.

A second benefit: **unit price is the fund's true performance**. Total fund
value always rises when new money arrives, so it says nothing about whether the
stock picks worked. Unit price is immune to that. If it's up 16%, you're up 16%.

## What's in it

| Page | What it answers |
|---|---|
| Dashboard | What's the pool worth, what's everyone's share |
| Members | Each person's units, stake, profit, and annualised return |
| Contributions | Money in and out, and the unit price each payment bought at |
| Portfolio | Open positions, cost basis, unrealised P/L, price updates |
| Trades | Every buy and sell, with the reason you took it |
| Months | Cycle-by-cycle performance, measured on unit price |
| Insights | Win rate, payoff ratio, concentration, fees — in plain English |
| Settings | Fund setup, JSON/CSV export, import, danger zone |

Other things worth knowing:

- **Multi-currency.** Contributions and trades can be NGN or USD; everything
  reports in your base currency. Buying a US stock out of the naira pool is
  modelled as a real currency conversion, and FX moves show up in P/L.
- **Cost basis is average cost**, not FIFO — the convention investment clubs use,
  and the only one that survives partial sells without lot-tracking.
- **Prices are entered manually.** The engine reads from a dated price history,
  so auto-fetching later just means writing marks instead of typing them.
- **Warnings, not silent wrongness.** Overdrawn cash, unpriced holdings, and
  oversized sells surface on the dashboard instead of quietly skewing numbers.

## Going from "just me" to "the whole group"

Out of the box, data saves to your browser only. To make it shared and
invite-only, in this order:

1. Create a free project at [supabase.com](https://supabase.com).

2. **Turn off public sign-ups first.** Authentication → Sign In / Providers →
   Email → *"Allow new users to sign up"* → **off**. Supabase enables this by
   default, and leaving it on means anyone who finds the URL can read the anon
   key out of the page source and register themselves.

3. Open [`supabase/schema.sql`](supabase/schema.sql), **edit the bootstrap block
   at the bottom** to list the emails allowed in, then paste the whole file into
   the SQL Editor and run it. If that list is empty, nobody can get in —
   including you.

4. Add each person under Authentication → Users. **Tick "Auto Confirm User"**,
   or they'll get "Invalid login credentials" no matter what password you set,
   because Supabase waits on a confirmation email that never arrives.

5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — locally
   in `.env.local` (copy `.env.local.example`), and in Vercel under Settings →
   Environment Variables. Restart the dev server / redeploy.

Access needs **both** a Supabase account *and* an entry in `sc_allowed_emails`.
Two independent layers, so forgetting the sign-up toggle doesn't expose the
ledger on its own. A signed-in user who isn't on the list is told so explicitly
rather than being shown an empty ledger.

To remove someone: delete their row from `sc_allowed_emails` *or* delete their
user. Either is enough.

Before switching, use **Settings → Export backup** and re-import once connected.

### Deploying

With the GitHub repo connected to Vercel (Settings → Git), every push to `main`
deploys automatically — no CLI needed. Note that *connecting* the repo does not
deploy anything by itself; the first auto-deploy happens on the next push.

Without the Git connection, deploy manually with `npx vercel --prod`. Plain
`npx vercel` only creates a preview and won't update the live URL.

## Things it doesn't do yet

- Dividends aren't modelled — record one as a contribution if you need to, but
  it will issue units, which isn't quite right.
- Stock splits need manual adjustment of quantity and price.
- No audit trail of who changed what.
