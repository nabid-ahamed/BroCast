import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null

try {
  // Only attempt to create the client if the URL looks valid
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn('Supabase URL is missing or invalid. Check your .env file.')
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message)
}

export const supabase = supabaseInstance
