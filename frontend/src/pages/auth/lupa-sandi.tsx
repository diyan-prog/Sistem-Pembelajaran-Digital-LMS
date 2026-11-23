import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react'
import { Btn, Input } from '@/components/ui'
import { AuthShell } from './auth-shell'

export function LupaSandi() {
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [ok, setOk] = useState(false); const [l, setL] = useState(false)
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email) && !/^\d{8,}$/.test(email)) return setErr('Masukkan email atau NIS/NIP yang valid'); setErr(''); setL(true); setTimeout(() => { setL(false); setOk(true) }, 900) }
  return (
    <AuthShell>{ok ? (<div className="text-center"><span className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto"><CheckCircle2 size={34} /></span><h2 className="text-2xl font-extrabold mt-4">Permintaan Terkirim</h2><p className="text-muted mt-2">Tautan pengaturan ulang kata sandi telah dikirim ke akun <b className="text-ink">{email}</b> melalui tata usaha sekolah. Periksa dalam 1x24 jam.</p><Btn to="/login" full className="mt-6">Kembali ke Halaman Masuk</Btn></div>) : (<>
      <span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><KeyRound /></span><h2 className="text-2xl font-extrabold mt-4">Lupa Kata Sandi</h2><p className="text-muted mt-1 mb-5">Masukkan email atau NIS/NIP yang terdaftar untuk meminta pengaturan ulang kata sandi.</p>
      <form onSubmit={submit} className="space-y-4" noValidate><Input label="Email / NIS / NIP" value={email} onChange={(e) => setEmail(e.target.value)} error={err} icon={<Mail size={18} />} placeholder="contoh: rina.aulia@siswa.smkn2indramayu.sch.id" /><Btn type="submit" full loading={l}>Kirim Permintaan</Btn></form>
      <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali ke halaman masuk</Link></>)}</AuthShell>
  )
}
