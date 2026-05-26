-- Run if you already applied 001 with multi-currency columns

alter table public.monthly_budgets drop column if exists usd_to_eur_rate;

alter table public.khoroji_items drop column if exists currency;
alter table public.weekly_grocery_logs drop column if exists currency;

drop type if exists currency_code;
