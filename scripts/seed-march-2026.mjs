/**
 * Seed March 2026 household data.
 * Run: npm run seed:march
 */

const YEAR_MONTH = '2026-03'
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
  { person: 'aryana', vorodi: 2500, shakhsi: 200 },
  { person: 'shayan', vorodi: 3600, shakhsi: 200 },
]

const KHOROJI = {
  aryana: [
    { label: 'Zaban', amount: 60 },
    { label: 'CIJB', amount: 49 },
    { label: 'Belasting', amount: 70 },
    { label: 'Bimeh bedehi', amount: 50 },
    { label: 'Bimeh salamat', amount: 148 },
    { label: 'Klarna', amount: 60 },
    { label: 'Benzin', amount: 200 },
    { label: 'Bashga', amount: 100 },
  ],
  shayan: [
    { label: 'Piano (last one)', amount: 450 },
    { label: 'Credit', amount: 250 },
    { label: 'Coolblue', amount: 150 },
    { label: 'Belasting', amount: 54 },
    { label: 'Health insurance', amount: 162 },
    { label: 'Odido', amount: 26 },
    { label: 'Odido', amount: 15.66 },
    { label: 'Odido', amount: 40 },
    { label: 'Bime mashin', amount: 81 },
    { label: 'Bime safar', amount: 7 },
    { label: 'Bime motor', amount: 13 },
    { label: 'Basic Fit', amount: 30 },
    { label: 'Water', amount: 25 },
    { label: 'Klarna', amount: 100 },
    { label: 'Benzin', amount: 200 },
  ],
}

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
          is_checked: false,
          is_warning: false,
        },
      })
    }
    console.log(`  ${budget.person}: ${items.length} khoroji items`)
  }

  console.log('✓ March 2026 seeded. Open the app and go to March 2026.')
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
