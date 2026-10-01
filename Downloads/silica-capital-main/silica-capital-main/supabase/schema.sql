-- Silica Capital — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and run it once.

create table if not exists sc_settings (
  id                 int primary key default 1,
  fund_name          text not null default 'Silica Capital',
  base_currency      text not null default 'NGN',
  initial_unit_price numeric not null default 100,
  inception_date     date not null default current_date,
  constraint sc_settings_singleton check (id = 1)
);

create table if not exists sc_members (
  id        text primary key,
  name      text not null,
  email     text,
  joined_at date not null,
  active    boolean not null default true,
  color     text
);

create table if not exists sc_contributions (
  id        text primary key,
  member_id text not null references sc_members(id) on delete cascade,
  date      date not null,
  amount    numeric not null,
  currency  text not null,
  fx_rate   numeric not null default 1,
  note      text
);

create table if not exists sc_withdrawals (
  id        text primary key,
  member_id text not null references sc_members(id) on delete cascade,
  date      date not null,
  amount    numeric not null,
  currency  text not null,
  fx_rate   numeric not null default 1,
  note      text
);

create table if not exists sc_trades (
  id       text primary key,
  date     date not null,
  symbol   text not null,
  name     text,
  market   text not null,
  currency text not null,
  side     text not null check (side in ('BUY', 'SELL')),
  quantity numeric not null,
  price    numeric not null,
  fees     numeric not null default 0,
  fx_rate  numeric not null default 1,
  thesis   text,
  note     text
);

create table if not exists sc_price_marks (
  id       text primary key,
  symbol   text not null,
  date     date not null,
  price    numeric not null,
  currency text not null
);

create table if not exists sc_fx_marks (
  id       text primary key,
  currency text not null,
  date     date not null,
  rate     numeric not null
);

create index if not exists sc_contributions_date_idx on sc_contributions(date);
create index if not exists sc_trades_date_idx        on sc_trades(date);
create index if not exists sc_price_marks_lookup_idx on sc_price_marks(symbol, date);

insert into sc_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Access control — the fund is invite-only
-- ---------------------------------------------------------------------------
-- Two independent layers, so a single mistake doesn't expose the ledger:
--
--   1. Row-level security requires a signed-in user. The anon key that ships
--      in the page source therefore reads nothing on its own. (That key is
--      public by design — RLS is what protects the data, not secrecy of the key.)
--
--   2. Being signed in is NOT enough: the user's email must also appear in
--      sc_allowed_emails below. This matters because Supabase enables public
--      sign-ups by default, so without this layer someone could register
--      themselves and read everything. You should ALSO turn sign-ups off in
--      the dashboard (Authentication -> Sign In / Providers -> Email ->
--      "Allow new users to sign up" = off), but this layer means the ledger
--      stays private even if that toggle is ever flipped back on.
--
-- To add someone: insert their email here, then create their account under
-- Authentication -> Users (tick "Auto Confirm User", or they can't log in).
-- To remove someone: delete their row here and delete the user. Either alone
-- is enough to lock them out.

create table if not exists sc_allowed_emails (
  email text primary key,
  note  text
);

-- SECURITY DEFINER so the check itself can read the allow-list without
-- tripping over that table's own row-level security (which would recurse).
create or replace function sc_is_member()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from sc_allowed_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- The app calls this after sign-in to tell "not authorised" apart from
-- "no data yet" — without it an unapproved user just sees an empty ledger.
grant execute on function sc_is_member() to authenticated;

alter table sc_settings       enable row level security;
alter table sc_members        enable row level security;
alter table sc_contributions  enable row level security;
alter table sc_withdrawals    enable row level security;
alter table sc_trades         enable row level security;
alter table sc_price_marks    enable row level security;
alter table sc_fx_marks       enable row level security;
alter table sc_allowed_emails enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'sc_settings', 'sc_members', 'sc_contributions', 'sc_withdrawals',
    'sc_trades', 'sc_price_marks', 'sc_fx_marks', 'sc_allowed_emails'
  ]
  loop
    execute format('drop policy if exists %I on %I', t || '_member_access', t);
    -- Everyone on the allow-list can read and write everything. That matches how
    -- an investment club works: the whole group sees the whole book. To make
    -- some members read-only later, split this into separate select vs
    -- insert/update/delete policies.
    execute format(
      'create policy %I on %I for all to authenticated using (sc_is_member()) with check (sc_is_member())',
      t || '_member_access', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- BOOTSTRAP — edit this line before running, or you will lock yourself out.
-- Put your own email in first, then add the others.
-- ---------------------------------------------------------------------------
insert into sc_allowed_emails (email, note) values
  ('fisayobabz@gmail.com', 'admin')
  -- , ('tunde@example.com',  'member')
  -- , ('chidi@example.com',  'member')
on conflict (email) do nothing;
