import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Loader2, Lock } from 'lucide-react'
import { Btn } from '@/components/ui'
import { useApp } from '@/context'
import { supabase } from '@/lib/supabase'
import { AuthShell } from './auth-shell'
import { PasswordForm } from './password-form'

export function GantiSandi() {
  const nav = useNavigate()
  const { toast, logout } = useApp()
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setHasSession(!!session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return
      setHasSession(true)
      setChecking(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (checking) {
    return (
      <AuthShell>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted"><Loader2 size={18} className="animate-spin" />Memeriksa sesi pemulihan...</div>
      </AuthShell>
    )
  }

  if (!hasSession) {
    return (
      <AuthShell>
        <span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><KeyRound /></span>
        <h2 className="text-2xl font-extrabold mt-4">Sesi Tidak Ditemukan</h2>
        <p className="text-muted mt-1 mb-5">Sesi pemulihan tidak valid atau sudah kedaluwarsa. Minta kode OTP baru untuk melanjutkan.</p>
        <Btn to="/lupa-sandi" full>Minta Kode OTP</Btn>
        <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali ke halaman masuk</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><Lock /></span>
      <h2 className="text-2xl font-extrabold mt-4">Ganti Kata Sandi</h2>
      <p className="text-muted mt-1 mb-5">Gunakan kombinasi huruf besar, kecil, angka, dan simbol agar akunmu aman.</p>
      <PasswordForm
        requireOldPassword={false}
        onDone={() => {
          logout()
          toast('Kata sandi berhasil diubah. Silakan masuk kembali.')
          nav('/login', { replace: true })
        }}
      />
      <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali</Link>
    </AuthShell>
  )
}
