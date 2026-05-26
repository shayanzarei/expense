import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { getSupabaseEnv } from './env'

const env = getSupabaseEnv()

export const supabaseConfigured = env.isConfigured
export const supabaseConfigError = env.configError

/** Only created when URL + key are valid — avoids crash on bad Vercel env */
export const supabase: SupabaseClient<Database> = env.isConfigured
  ? createClient<Database>(env.url!, env.anonKey!)
  : (null as unknown as SupabaseClient<Database>)
