/**
 * Seed April 2026 household data.
 * Run: npm run seed:april
 */

const YEAR_MONTH = '2026-04'
const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function rest(path, { method = 'GET', body, query = '' } = {}) {
  const res = await fetch(`${url}/rest/v1/${path}${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(`${method} ${path}: ${data?.message ?? text}`)
  }
  return data
}

const BUDGETS = [
  { person: 'aryana', vorodi: 2392, shakhsi: 50 },
  { person: 'shayan', vorodi: 3600, shakhsi: 100 },
]

const KHOROJI = {
  aryana: [
    { label: 'CIJB', amount: 49 },
    { label: 'Belasting', amount: 70 },
    { label: 'Bimeh salamat', amount: 148 },
    { label: 'Klarna', amount: 77 },
    { label: 'Benzin', amount: 200 },
    { label: 'Bashga', amount: 100 },
    { label: 'Zaban', amount: 120 },
  ],
  shayan: [
    { label: 'Benzin', amount: 200 },
    { label: 'Bime motor', amount: 13 },
    { label: 'Basic Fit', amount: 30 },
    { label: 'Credit', amount: 1250 },
    { label: 'Bime safar', amount: 7 },
    { label: 'Bime mashin', amount: 81 },
    { label: 'Water', amount: 25 },
    { label: 'Odido', amount: 19.2 },
    { label: 'Odido', amount: 22 },
    { label: 'Odido', amount: 40 },
    { label: 'Belasting', amount: 54 },
    { label: 'GBLT', amount: 35 },
    { label: 'Klarna', amount: 96 },
    { label: 'Health insurance', amount: 162 },
    { label: 'Coolblue', amount: 150 },
  ],
}

const GROCERY_WEEKS = [
  { week_number: 1, amount_used: 163.88, notes: '25 Mar – 1 Apr (1st week / safar overlap)' },
  { week_number: 2, amount_used: 80, notes: '1–8 Apr (2nd week / safar)' },
  { week_number: 3, amount_used: 200, notes: '8–15 Apr (3rd week)' },
  { week_number: 4, amount_used: 200, notes: '15–22 Apr (4th week)' },
]

async function main() {
  console.log(`Seeding ${YEAR_MONTH}…`)

  const existing = await rest('monthly_budgets', {
    query: `?year_month=eq.${YEAR_MONTH}&select=id,person`,
  })

  for (const row of existing ?? []) {
    await rest('khoroji_items', {
      method: 'DELETE',
      query: `?monthly_budget_id=eq.${row.id}`,
    })
  }

  if (existing?.length) {
    await rest('monthly_budgets', {
      method: 'DELETE',
      query: `?year_month=eq.${YEAR_MONTH}`,
    })
  }

  await rest('weekly_grocery_logs', {
    method: 'DELETE',
    query: `?year_month=eq.${YEAR_MONTH}`,
  })

  await rest('monthly_grocery_meta', {
    method: 'DELETE',
    query: `?year_month=eq.${YEAR_MONTH}`,
  })

  const budgetRows = []
  for (const b of BUDGETS) {
    const [row] = await rest('monthly_budgets', {
      method: 'POST',
      body: {
        year_month: YEAR_MONTH,
        person: b.person,
        vorodi: b.vorodi,
        shakhsi: b.shakhsi,
      },
    })
    budgetRows.push(row)
    console.log(`  ${b.person}: vorodi €${b.vorodi}, shakhsi €${b.shakhsi}`)
  }

  for (const budget of budgetRows) {
    const items = KHOROJI[budget.person]
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await rest('khoroji_items', {
        method: 'POST',
        body: {
          monthly_budget_id: budget.id,
          label: item.label,
          amount: item.amount,
          sort_order: i,
          is_checked: true,
          is_warning: false,
        },
      })
    }
    const total = items.reduce((s, x) => s + x.amount, 0)
    console.log(`  ${budget.person}: ${items.length} khoroji (€${total.toFixed(2)})`)
  }

  for (const week of GROCERY_WEEKS) {
    await rest('weekly_grocery_logs', {
      method: 'POST',
      body: { year_month: YEAR_MONTH, ...week },
    })
  }
  const groceryTotal = GROCERY_WEEKS.reduce((s, w) => s + w.amount_used, 0)
  console.log(`  groceries: 4 weeks (€${groceryTotal.toFixed(2)} used)`)

  await rest('monthly_grocery_meta', {
    method: 'POST',
    body: { year_month: YEAR_MONTH, lona_amount_used: 0 },
  })

  console.log('✓ April 2026 seeded. Open the app and select April 2026.')
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
