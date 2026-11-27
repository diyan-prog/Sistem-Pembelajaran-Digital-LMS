import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi')
}

// Project ref dipakai supabase-js sebagai bagian nama kunci localStorage
// (`sb-<ref>-auth-token`). Sesi sisa project lain tidak akan pernah terbaca
// klien ini dan membuat aplikasi tampak login padahal tidak punya token.
export const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

const purgeForeignSessions = () => {
  try {
    const prefix = 'sb-'
    const keep = `${prefix}${projectRef}-`
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix) && !key.startsWith(keep)) localStorage.removeItem(key)
    }
  } catch {
    // localStorage tidak tersedia (mode privat): abaikan.
  }
}

purgeForeignSessions()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: `sb-${projectRef}-auth-token`,
  },
})
