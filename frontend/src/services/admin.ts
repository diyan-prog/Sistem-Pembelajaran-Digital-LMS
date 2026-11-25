import { supabase } from '@/lib/supabase'

const BASE_URL = 'http://localhost:8080/api/v1'

type AdminUsersPayload =
  | { action: 'create'; email: string; password: string; email_confirm?: boolean; user_metadata?: Record<string, unknown> }
  | { action: 'update-role'; id: string; role: string }
  | { action: 'update-status'; id: string; status: string }
  | { action: 'reset-password'; id: string; password: string }

// adminUsers memanggil backend Go POST /api/v1/admin/users (menggantikan Edge Function).
export async function adminUsers(payload: AdminUsersPayload) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || ''
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body?.error?.message || body?.error || `Request gagal: ${res.status}`
    throw new Error(msg)
  }
  return body?.data ?? body
}