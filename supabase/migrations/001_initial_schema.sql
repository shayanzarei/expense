-- Vorodi / Khoroji expense tracker — initial schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type person_name as enum ('aryana', 'shayan');

-- ---------------------------------------------------------------------------
-- monthly_budgets: Vorodi + Shakhsi per person per month (amounts in EUR)
-- ---------------------------------------------------------------------------
create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  year_month text not null check (year_month ~ '^\d{4}-\d{2}$'),
  person person_name not null,
  vorodi numeric(12, 2) not null default 0,
  shakhsi numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_budgets_person_month_unique unique (year_month, person)
);

create index monthly_budgets_year_month_idx on public.monthly_budgets (year_month);

-- ---------------------------------------------------------------------------
-- khoroji_items: individual expense line items
-- ---------------------------------------------------------------------------
create table public.khoroji_items (
  id uuid primary key default gen_random_uuid(),
  monthly_budget_id uuid not null references public.monthly_budgets (id) on delete cascade,
  label text not null default '',
  amount numeric(12, 2) not null default 0,
  is_checked boolean not null default false,
  is_warning boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index khoroji_items_budget_id_idx on public.khoroji_items (monthly_budget_id);

-- ---------------------------------------------------------------------------
-- weekly_grocery_logs: Khordo Khorak weekly ledger (200€ target / week)
-- ---------------------------------------------------------------------------
create table public.weekly_grocery_logs (
  id uuid primary key default gen_random_uuid(),
  year_month text not null check (year_month ~ '^\d{4}-\d{2}$'),
  week_number smallint not null check (week_number between 1 and 4),
  amount_used numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_grocery_logs_month_week_unique unique (year_month, week_number)
);

create index weekly_grocery_logs_year_month_idx on public.weekly_grocery_logs (year_month);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger monthly_budgets_updated_at
  before update on public.monthly_budgets
  for each row execute function public.set_updated_at();

create trigger khoroji_items_updated_at
  before update on public.khoroji_items
  for each row execute function public.set_updated_at();

create trigger weekly_grocery_logs_updated_at
  before update on public.weekly_grocery_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (permissive for household — tighten with Auth later)
-- ---------------------------------------------------------------------------
alter table public.monthly_budgets enable row level security;
alter table public.khoroji_items enable row level security;
alter table public.weekly_grocery_logs enable row level security;

create policy "Allow all for monthly_budgets"
  on public.monthly_budgets for all
  using (true) with check (true);

create policy "Allow all for khoroji_items"
  on public.khoroji_items for all
  using (true) with check (true);

create policy "Allow all for weekly_grocery_logs"
  on public.weekly_grocery_logs for all
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Realtime replication
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.monthly_budgets;
alter publication supabase_realtime add table public.khoroji_items;
alter publication supabase_realtime add table public.weekly_grocery_logs;
