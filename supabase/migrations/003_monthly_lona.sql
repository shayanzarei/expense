-- Lona: €100 per month (not per week), tracked separately from weekly grocery spend

create table public.monthly_grocery_meta (
  id uuid primary key default gen_random_uuid(),
  year_month text not null check (year_month ~ '^\d{4}-\d{2}$'),
  lona_amount_used numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_grocery_meta_year_month_unique unique (year_month)
);

create index monthly_grocery_meta_year_month_idx on public.monthly_grocery_meta (year_month);

create trigger monthly_grocery_meta_updated_at
  before update on public.monthly_grocery_meta
  for each row execute function public.set_updated_at();

alter table public.monthly_grocery_meta enable row level security;

create policy "Allow all for monthly_grocery_meta"
  on public.monthly_grocery_meta for all
  using (true) with check (true);

alter publication supabase_realtime add table public.monthly_grocery_meta;
