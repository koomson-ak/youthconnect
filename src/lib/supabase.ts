import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev to catch missing config
  console.warn(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Attendance = {
  id?: string
  first_name: string
  last_name: string
  other_names?: string | null
  gender?: string | null
  phone: string
  // timestamp is set by the database (timestamptz)
  timestamp?: string | null
}

export async function getAttendances() {
  // Return rows ordered by newest first
  const { data, error } = await supabase
    .from('youth_attendance')
    .select('*')
    .order('timestamp', { ascending: false })

  return { data, error }
}

export async function addAttendance(entry: Pick<Attendance, 'first_name' | 'last_name' | 'other_names' | 'phone' | 'gender'>) {
  const { data, error } = await supabase
    .from('youth_attendance')
    .insert(entry)
    .select()

  return { data, error }
}

export async function getAttendanceByPhone(phone: string) {
  if (!phone) return { data: null, error: null }

  const { data, error } = await supabase
    .from('youth_attendance')
    .select('*')
    .eq('phone', phone)
    .order('timestamp', { ascending: false })
    .limit(1)

  // data will be an array; return the first item for convenience
  return { data: Array.isArray(data) && data.length > 0 ? data[0] : null, error }
}

export async function deleteAttendanceById(id: string) {
  const { error } = await supabase
    .from('youth_attendance')
    .delete()
    .eq('id', id)

  return { error }
}

export async function deleteMultipleAttendances(ids: string[]) {
  const { error } = await supabase
    .from('youth_attendance')
    .delete()
    .in('id', ids)

  return { error }
}

export async function clearAllAttendances() {
  // Get all IDs first, then delete them
  const { data: allEntries } = await supabase
    .from('youth_attendance')
    .select('id')

  if (!allEntries || allEntries.length === 0) {
    return { error: null }
  }

  const ids = allEntries.map(e => e.id)
  const { error } = await supabase
    .from('youth_attendance')
    .delete()
    .in('id', ids)

  return { error }
}

// Example realtime subscription helper. Returns an unsubscribe function.
export function subscribeAttendances(onChange: (payload: any) => void) {
  // Using the Realtime/Channels API
  const channel = supabase
    .channel('public:youth_attendance')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'youth_attendance' },
      (payload) => onChange(payload)
    )
    .subscribe()

  return () => {
    // Remove channel subscription
    // supabase.removeChannel is the correct function for v2
    // but we defensively check it
    try {
      supabase.removeChannel(channel)
    } catch (e) {
      // fallback: unsubscribe if needed
      // eslint-disable-next-line no-console
      console.warn('Failed to remove Supabase channel', e)
    }
  }
}
