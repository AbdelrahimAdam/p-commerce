import { createClient } from '@supabase/supabase-js'

// Try both naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables', {
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_URL: !!import.meta.env.SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_ANON_KEY: !!import.meta.env.SUPABASE_ANON_KEY
  })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
