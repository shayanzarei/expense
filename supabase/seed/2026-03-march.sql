-- March 2026 seed (run in SQL Editor if you prefer SQL over npm run seed:march)

delete from public.khoroji_items
where monthly_budget_id in (
  select id from public.monthly_budgets where year_month = '2026-03'
);
delete from public.weekly_grocery_logs where year_month = '2026-03';
delete from public.monthly_budgets where year_month = '2026-03';

insert into public.monthly_budgets (year_month, person, vorodi, shakhsi) values
  ('2026-03', 'aryana', 2500, 200),
  ('2026-03', 'shayan', 3600, 200);

insert into public.khoroji_items (monthly_budget_id, label, amount, sort_order)
select b.id, v.label, v.amount, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('Zaban', 60::numeric, 0),
    ('CIJB', 49, 1),
    ('Belasting', 70, 2),
    ('Bimeh bedehi', 50, 3),
    ('Bimeh salamat', 148, 4),
    ('Klarna', 60, 5),
    ('Benzin', 200, 6),
    ('Bashga', 100, 7)
) as v(label, amount, ord)
where b.year_month = '2026-03' and b.person = 'aryana';

insert into public.khoroji_items (monthly_budget_id, label, amount, sort_order)
select b.id, v.label, v.amount, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('Piano (last one)', 450::numeric, 0),
    ('Credit', 250, 1),
    ('Coolblue', 150, 2),
    ('Belasting', 54, 3),
    ('Health insurance', 162, 4),
    ('Odido', 26, 5),
    ('Odido', 15.66, 6),
    ('Odido', 40, 7),
    ('Bime mashin', 81, 8),
    ('Bime safar', 7, 9),
    ('Bime motor', 13, 10),
    ('Basic Fit', 30, 11),
    ('Water', 25, 12),
    ('Klarna', 100, 13),
    ('Benzin', 200, 14)
) as v(label, amount, ord)
where b.year_month = '2026-03' and b.person = 'shayan';
