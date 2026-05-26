/** Normalize Vercel / .env values into a valid Supabase project URL */
export function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim()
  if (!value) return undefined

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '')
  } catch {
    return undefined
  }
}

export function getSupabaseEnv() {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  const url = normalizeSupabaseUrl(rawUrl)

  let configError: string | null = null
  if (!url) {
    if (rawUrl) {
      configError = `VITE_SUPABASE_URL is not valid: "${rawUrl}". Use https://YOUR_REF.supabase.co (https:// required).`
    } else {
      configError =
        'VITE_SUPABASE_URL is missing. Add it in Vercel → Settings → Environment Variables, then redeploy.'
    }
  } else if (!anonKey) {
    configError =
      'VITE_SUPABASE_ANON_KEY is missing. Add the anon / publishable key from Supabase → API, then redeploy.'
  }

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
    configError,
  }
}
