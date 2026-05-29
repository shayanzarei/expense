import { supabaseConfigError } from '../lib/supabase'

export function SupabaseConfigBanner() {
  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-semibold">Supabase not configured on this deploy</p>
      {supabaseConfigError && (
        <p className="mt-2 rounded-lg bg-amber-100/80 px-2 py-1.5 font-mono text-[11px] leading-relaxed dark:bg-amber-900/50">
          {supabaseConfigError}
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed">
        In Vercel → Project → <strong>Settings → Environment Variables</strong>, add
        both (names must match exactly):
      </p>
      <ul className="mt-2 list-inside list-disc font-mono text-xs">
        <li>VITE_SUPABASE_URL</li>
        <li>VITE_SUPABASE_ANON_KEY</li>
      </ul>
      <p className="mt-2 text-xs leading-relaxed">
        Use the <strong>anon</strong> / <strong>publishable</strong> key from Supabase →
        Project Settings → API (not the service_role secret). Enable for Production,
        Preview, and Development, then <strong>Redeploy</strong> — Vite reads these at
        build time, so a new deploy is required after you add or change them.
      </p>
    </div>
  )
}
