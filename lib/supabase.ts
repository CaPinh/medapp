import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side (API routes) - bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Patient = {
  id: string
  name: string
  phone: string
  email?: string
  birth_date?: string
  notes?: string
  created_at: string
}

export type Appointment = {
  id: string
  patient_id: string
  date: string
  time: string
  duration_min: number
  type: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  reminder_sent: boolean
  created_at: string
  patient?: Patient
}
