import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const fallbackUrl = 'http://localhost:54321'
const fallbackAnon = 'public-anon-placeholder'

export const supabase = createClient(supabaseUrl ?? fallbackUrl, supabaseAnonKey ?? fallbackAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
