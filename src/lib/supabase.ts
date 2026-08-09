// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ SINGLETON PATTERN - Only create one instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  // Only create client if it doesn't exist
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create the client
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  return supabaseInstance
})()

// Optional: Export a function to get the singleton
export const getSupabaseClient = () => {
  return supabase
}

// Optional: Reset for testing
export const resetSupabaseInstance = () => {
  supabaseInstance = null
}