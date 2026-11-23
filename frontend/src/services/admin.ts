import { supabase } from '@/lib/supabase'

type AdminUsersPayload =
  | { action: 'create'; email: string; password: string; email_confirm?: boolean; user_metadata?: Record<string, unknown> }
  | { action: 'update-role'; id: string; role: string }
  | { action: 'update-status'; id: string; status: string }
  | { action: 'reset-password'; id: string; password: string }

export async function adminUsers(payload: AdminUsersPayload) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body: payload })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}
