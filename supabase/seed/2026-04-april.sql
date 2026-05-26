-- April 2026 seed (run in SQL Editor or: npm run seed:april)

delete from public.khoroji_items
where monthly_budget_id in (
  select id from public.monthly_budgets where year_month = '2026-04'
);
delete from public.weekly_grocery_logs where year_month = '2026-04';
delete from public.monthly_grocery_meta where year_month = '2026-04';
delete from public.monthly_budgets where year_month = '2026-04';

insert into public.monthly_budgets (year_month, person, vorodi, shakhsi) values
  ('2026-04', 'aryana', 2392, 50),
  ('2026-04', 'shayan', 3600, 100);

insert into public.khoroji_items (monthly_budget_id, label, amount, is_checked, sort_order)
select b.id, v.label, v.amount, true, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('CIJB', 49::numeric, 0),
    ('Belasting', 70, 1),
    ('Bimeh salamat', 148, 2),
    ('Klarna', 77, 3),
    ('Benzin', 200, 4),
    ('Bashga', 100, 5),
    ('Zaban', 120, 6)
) as v(label, amount, ord)
where b.year_month = '2026-04' and b.person = 'aryana';

insert into public.khoroji_items (monthly_budget_id, label, amount, is_checked, sort_order)
select b.id, v.label, v.amount, true, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('Benzin', 200::numeric, 0),
    ('Bime motor', 13, 1),
    ('Basic Fit', 30, 2),
    ('Credit', 1250, 3),
    ('Bime safar', 7, 4),
    ('Bime mashin', 81, 5),
    ('Water', 25, 6),
    ('Odido', 19.20, 7),
    ('Odido', 22, 8),
    ('Odido', 40, 9),
    ('Belasting', 54, 10),
    ('GBLT', 35, 11),
    ('Klarna', 96, 12),
    ('Health insurance', 162, 13),
    ('Coolblue', 150, 14)
) as v(label, amount, ord)
where b.year_month = '2026-04' and b.person = 'shayan';

insert into public.weekly_grocery_logs (year_month, week_number, amount_used, notes) values
  ('2026-04', 1, 163.88, '25 Mar – 1 Apr (1st week / safar overlap)'),
  ('2026-04', 2, 80, '1–8 Apr (2nd week / safar)'),
  ('2026-04', 3, 200, '8–15 Apr (3rd week)'),
  ('2026-04', 4, 200, '15–22 Apr (4th week)');

insert into public.monthly_grocery_meta (year_month, lona_amount_used) values
  ('2026-04', 0);
