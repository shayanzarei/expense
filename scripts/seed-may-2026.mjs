/**
 * Seed May 2026 household data.
 * Run: npm run seed:may
 */

const YEAR_MONTH = '2026-05'
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
  { person: 'aryana', vorodi: 2392, shakhsi: 200 },
  { person: 'shayan', vorodi: 3600, shakhsi: 200 },
]

const KHOROJI = {
  aryana: [
    { label: 'CIJB', amount: 49, is_checked: true },
    { label: 'Belasting', amount: 70, is_checked: true },
    { label: 'Benzin', amount: 200, is_checked: true },
    { label: 'Zaban', amount: 120, is_checked: true },
    { label: 'Bimeh salamat', amount: 148, is_checked: true },
    { label: 'Klarna', amount: 77, is_checked: true },
    { label: 'Bashga', amount: 100, is_checked: true },
  ],
  shayan: [
    { label: 'Belasting', amount: 54, is_checked: false },
    { label: 'Benzin', amount: 200, is_checked: true },
    { label: 'Tamirat Ab (subscription)', amount: 45, is_checked: true },
    { label: 'Bime motor', amount: 13, is_checked: true },
    { label: 'Odido home', amount: 40, is_checked: true },
    { label: 'Odido', amount: 19.2, is_checked: true },
    { label: 'Bime safar', amount: 7, is_checked: true },
    { label: 'Bime mashin', amount: 81, is_checked: true },
    { label: 'Water', amount: 21, is_checked: true },
    { label: 'Basic Fit', amount: 30, is_checked: true },
    { label: 'Klarna', amount: 92, is_checked: true },
    { label: 'DJ software', amount: 200, is_checked: true },
    { label: 'Odido', amount: 26, is_checked: true },
    { label: 'GBLT', amount: 35, is_checked: true },
    { label: 'Credit', amount: 305, is_checked: true },
    { label: 'Road tax (Mahi)', amount: 31, is_checked: true },
    { label: 'Health insurance', amount: 162, is_checked: true },
    { label: 'Coolblue', amount: 150, is_checked: true },
    { label: 'GbTwente', amount: 6.3, is_checked: true },
  ],
}

const GROCERY_WEEKS = [
  { week_number: 1, amount_used: 251.64, notes: '27 Apr – 1 May (1st week)' },
  { week_number: 2, amount_used: 200, notes: '4–10 May (2nd week)' },
  { week_number: 3, amount_used: 150, notes: '11–17 May (3rd week)' },
  { week_number: 4, amount_used: 200, notes: '18–24 May (4th week)' },
]

const LONA_USED = 50

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
          is_checked: item.is_checked,
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
    body: { year_month: YEAR_MONTH, lona_amount_used: LONA_USED },
  })
  console.log(`  lona: €${LONA_USED}`)

  const aKhoroji = KHOROJI.aryana.reduce((s, x) => s + x.amount, 0)
  const sKhoroji = KHOROJI.shayan.reduce((s, x) => s + x.amount, 0)
  console.log(
    `  ABN available (app): Aryana €${(2392 - aKhoroji - 200).toFixed(2)}, Shayan €${(3600 - sKhoroji - 200).toFixed(2)}`,
  )
  console.log('✓ May 2026 seeded. Open the app and select May 2026.')
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
