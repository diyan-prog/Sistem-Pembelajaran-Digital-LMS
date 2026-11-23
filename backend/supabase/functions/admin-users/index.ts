import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Metode tidak diizinkan' }, 405)

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anonKey || !serviceRoleKey) return json({ error: 'Konfigurasi server tidak lengkap' }, 500)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'Tidak terautentikasi' }, 401)

  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  })

  const { data: { user }, error: userError } = await callerClient.auth.getUser()
  if (userError || !user) return json({ error: 'Sesi tidak valid' }, 401)

  const { data: caller } = await callerClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['super_admin', 'tata_usaha', 'tu']
  if (!caller?.role || !allowedRoles.includes(caller.role)) {
    return json({ error: 'Tidak memiliki izin' }, 403)
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Body tidak valid' }, 400)
  }

  const action = payload.action

  if (action === 'create') {
    const email = String(payload.email ?? '')
    const password = String(payload.password ?? '')
    if (!email || !password) return json({ error: 'Email dan kata sandi wajib diisi' }, 400)

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: payload.email_confirm === true,
      user_metadata: (payload.user_metadata as Record<string, unknown>) ?? {},
    })
    if (error) return json({ error: error.message }, 400)
    return json({ user: data.user })
  }

  if (action === 'update-role') {
    const id = String(payload.id ?? '')
    const role = String(payload.role ?? '')
    if (!id || !role) return json({ error: 'ID dan role wajib diisi' }, 400)

    const { error } = await admin.from('profiles').update({ role }).eq('id', id)
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true })
  }

  if (action === 'update-status') {
    const id = String(payload.id ?? '')
    const status = String(payload.status ?? '')
    if (!id || !status) return json({ error: 'ID dan status wajib diisi' }, 400)

    const { error } = await admin.from('profiles').update({ status }).eq('id', id)
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true })
  }

  if (action === 'reset-password') {
    const id = String(payload.id ?? '')
    const password = String(payload.password ?? '')
    if (!id || !password) return json({ error: 'ID dan kata sandi wajib diisi' }, 400)

    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true })
  }

  return json({ error: 'Aksi tidak dikenal' }, 400)
})
