import { createClient } from '@supabase/supabase-js'

// .trim() guards against a stray leading/trailing space in the env var value
// (an easy mistake to make pasting into Vercel's dashboard) — an untrimmed
// key gets silently sent as-is, which Supabase rejects, breaking both REST
// calls and the realtime websocket with no obvious error at the call site.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
