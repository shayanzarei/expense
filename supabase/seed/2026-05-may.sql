-- May 2026 seed (run in SQL Editor or: npm run seed:may)

delete from public.khoroji_items
where monthly_budget_id in (
  select id from public.monthly_budgets where year_month = '2026-05'
);
delete from public.weekly_grocery_logs where year_month = '2026-05';
delete from public.monthly_grocery_meta where year_month = '2026-05';
delete from public.monthly_budgets where year_month = '2026-05';

insert into public.monthly_budgets (year_month, person, vorodi, shakhsi) values
  ('2026-05', 'aryana', 2392, 200),
  ('2026-05', 'shayan', 3600, 200);

insert into public.khoroji_items (monthly_budget_id, label, amount, is_checked, sort_order)
select b.id, v.label, v.amount, v.is_paid, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('CIJB', 49::numeric, true, 0),
    ('Belasting', 70, true, 1),
    ('Benzin', 200, true, 2),
    ('Zaban', 120, true, 3),
    ('Bimeh salamat', 148, true, 4),
    ('Klarna', 77, true, 5),
    ('Bashga', 100, true, 6)
) as v(label, amount, is_paid, ord)
where b.year_month = '2026-05' and b.person = 'aryana';

insert into public.khoroji_items (monthly_budget_id, label, amount, is_checked, sort_order)
select b.id, v.label, v.amount, v.is_paid, v.ord
from public.monthly_budgets b
cross join lateral (
  values
    ('Belasting', 54::numeric, false, 0),
    ('Benzin', 200, true, 1),
    ('Tamirat Ab (subscription)', 45, true, 2),
    ('Bime motor', 13, true, 3),
    ('Odido home', 40, true, 4),
    ('Odido', 19.20, true, 5),
    ('Bime safar', 7, true, 6),
    ('Bime mashin', 81, true, 7),
    ('Water', 21, true, 8),
    ('Basic Fit', 30, true, 9),
    ('Klarna', 92, true, 10),
    ('DJ software', 200, true, 11),
    ('Odido', 26, true, 12),
    ('GBLT', 35, true, 13),
    ('Credit', 305, true, 14),
    ('Road tax (Mahi)', 31, true, 15),
    ('Health insurance', 162, true, 16),
    ('Coolblue', 150, true, 17),
    ('GbTwente', 6.30, true, 18)
) as v(label, amount, is_paid, ord)
where b.year_month = '2026-05' and b.person = 'shayan';

insert into public.weekly_grocery_logs (year_month, week_number, amount_used, notes) values
  ('2026-05', 1, 251.64, '27 Apr – 1 May (1st week)'),
  ('2026-05', 2, 200, '4–10 May (2nd week)'),
  ('2026-05', 3, 150, '11–17 May (3rd week)'),
  ('2026-05', 4, 200, '18–24 May (4th week)');

insert into public.monthly_grocery_meta (year_month, lona_amount_used) values
  ('2026-05', 50);
