# Vorodi & Khoroji — Household Finance Tracker

Mobile-first collaborative expense tracker for two partners, replacing a shared Apple Notes workflow. Built with **Vite**, **React**, **Tailwind CSS**, and **Supabase** (PostgreSQL + Realtime).

## Domain vocabulary

| Term | Meaning |
|------|---------|
| **Vorodi** | Monthly income (salary) |
| **Khoroji** | Personal bills paid from salary (tax, insurance, subscriptions, etc.) |
| **Shakhsi** | Personal pocket money per person (often €200, adjustable per month) — kept, not sent to ABN |
| **Hypotheek** | Fixed €1,100/person mortgage share |
| **Bimeh Khone** | House insurance — Aryana €23, Shayan €25 |
| **Khordo Khorak** | Groceries €200/week (€800/mo) + Lona €100/month |
| **ABN AMRO** | Shared joint account — fixed monthly transfer per person |

## Transfer formula

Shared costs (household):

| Item | Amount |
|------|--------|
| Vam (loan) | €2,200/mo → €1,100 per person |
| Bimeh Khone | €47/mo (Aryana €23, Shayan €25) |
| Khordo Khorak | €900/mo (€800 groceries + €100 Lona) → €450 per person |

**ABN AMRO transfer (fixed, per person):**

`Avale mah` = €1,100 + that person’s Bimeh Khone  
`Khordo share` = €900 ÷ 2 = €450  
**Total** = Avale mah + Khordo share (e.g. Shayan €1,125 + €450 = **€1,575**)

During the month, fund groceries on ABN with **€200/week** (€100 start + €100 end of week × 4). Lona €100 is part of the €900 pool, not extra on top.

**Monthly flow (per person):**

1. **Vorodi** (salary)  
2. **Khoroji** (bills from your account)  
3. **Shakhsi** (pocket money you keep — amount varies by month)  
4. **Available for ABN** = Vorodi − Σ(Khoroji) − Shakhsi → compare to **target** (€1,573 / €1,575)  
5. Transfer to **ABN AMRO** → funds avale mah (€1,100 + bimeh) + khordo pool (€900)  
6. **Weekly tracker** — €200/week groceries + €100 Lona on the joint account  

If available &lt; target, cut/delay khoroji or accept a lower ABN transfer that month.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial_schema.sql` in the **SQL Editor**.
3. In **Database → Replication**, confirm `monthly_budgets`, `khoroji_items`, and `weekly_grocery_logs` are enabled for Realtime.

### 2. Environment

One production Supabase project — same keys for `npm run dev` and deploy:

```bash
cp .env.example .env
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**.  
On your host (Vercel, Netlify, …), set the same two variables for production builds.

### 3. Run locally

```bash
npm install
npm run dev
```

Open on your phone (same Wi‑Fi) or add to Home Screen for a PWA-like experience.

## Architecture

```
src/
├── lib/
│   ├── math-engine.ts      # Pure calculation logic
│   └── supabase.ts         # Typed Supabase client
├── hooks/
│   └── useMonthlyFinance.ts # Fetch, mutations, Realtime
├── context/
│   └── MonthlyFinanceContext.tsx
├── components/
│   ├── IncomeHeader.tsx    # Vorodi + Shakhsi inputs
│   ├── KhorojiList.tsx     # Expandable expense lists
│   ├── KhorojiItemRow.tsx  # ✅ paid toggle, € amounts, delete
│   ├── WeeklyTracker.tsx   # Khordo Khorak weeks 1–4
│   └── TransferResultCard.tsx  # Sticky ABN AMRO summary
└── pages/
    └── Dashboard.tsx
```

## Security note

RLS policies are permissive for quick setup. Before production, enable **Supabase Auth** and restrict policies to your two user IDs.
