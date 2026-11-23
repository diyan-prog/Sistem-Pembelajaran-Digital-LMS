import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useApp } from '@/context'
import { ROLES } from '@/lib/roles'
import { AuthShell } from './auth-shell'
import { PasswordForm } from './password-form'

export function GantiSandi() {
  const nav = useNavigate(); const { toast, role } = useApp()
  return <AuthShell><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><Lock /></span><h2 className="text-2xl font-extrabold mt-4">Ganti Kata Sandi</h2><p className="text-muted mt-1 mb-5">Gunakan kombinasi huruf besar, kecil, angka, dan simbol agar akunmu aman.</p>
    <PasswordForm onDone={() => { toast('Kata sandi berhasil diubah'); nav(role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login') }} /><Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali</Link></AuthShell>
}
