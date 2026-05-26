const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('✗ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  console.error('  Copy .env.example → .env and add keys from Supabase → Settings → API')
  process.exit(1)
}

if (url.includes('YOUR_PROJECT') || key.includes('your-anon')) {
  console.error('✗ .env still has placeholder values')
  process.exit(1)
}

const res = await fetch(`${url}/rest/v1/monthly_budgets?select=id&limit=1`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
})

if (res.status === 401 || res.status === 403) {
  console.error('✗ Invalid API key or URL')
  console.error(`  HTTP ${res.status}:`, await res.text())
  console.error('  → Use Project URL + anon/publishable key from Supabase → Settings → API')
  process.exit(1)
}

if (!res.ok) {
  const body = await res.text()
  console.error(`✗ Request failed (HTTP ${res.status})`)
  console.error(' ', body)
  if (body.includes('does not exist') || res.status === 404) {
    console.error('  → Run supabase/migrations/001_initial_schema.sql in the SQL Editor')
  }
  process.exit(1)
}

const rows = await res.json()
console.log('✓ Connected to Supabase')
console.log(`  URL: ${url}`)
console.log(`  Table monthly_budgets: reachable (${rows.length} row(s) in sample)`)
