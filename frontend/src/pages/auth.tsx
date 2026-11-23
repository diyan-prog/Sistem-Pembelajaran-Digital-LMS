import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookMarked, CheckCircle2, Eye, EyeOff, FolderOpen, KeyRound, Lock, Mail, QrCode, ShieldCheck, User, Users, GraduationCap, School, Crown, ClipboardCheck } from 'lucide-react'
import { Btn, Field, Input, cn } from '@/components/ui'
import { Logo } from '@/components/layouts'
import { ROLES, type Role } from '@/lib/roles'
import { useApp } from '@/context'

export function SchoolIllustration() {
  return (
    <svg viewBox="0 0 480 300" className="w-full max-w-[460px]" aria-hidden>
      <ellipse cx="240" cy="262" rx="220" ry="22" fill="rgba(0,0,0,.12)" />
      <circle cx="400" cy="60" r="34" fill="#FDE68A" /><g fill="#fff" opacity=".9"><ellipse cx="90" cy="58" rx="40" ry="14" /><ellipse cx="116" cy="48" rx="26" ry="13" /><ellipse cx="330" cy="100" rx="34" ry="11" /></g>
      <rect x="90" y="130" width="300" height="130" rx="6" fill="#fff" /><rect x="190" y="90" width="100" height="170" rx="6" fill="#F3F4F6" /><path d="M180 92l60-40 60 40z" fill="#0E86C7" /><circle cx="240" cy="116" r="14" fill="#fff" stroke="#0B3D5F" strokeWidth="4" /><path d="M240 108v8h6" stroke="#0B3D5F" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="222" y="196" width="36" height="64" rx="4" fill="#0B3D5F" />
      {[110, 140, 316, 346].map((x) => <rect key={x} x={x} y="160" width="26" height="34" rx="4" fill="#BBE5C6" />)}{[110, 140, 316, 346].map((x) => <rect key={x + 1} x={x} y="214" width="26" height="30" rx="4" fill="#BBE5C6" />)}
      <rect x="216" y="30" width="2.5" height="36" fill="#fff" /><path d="M218 30h26l-6 7 6 7h-26z" fill="#F59E0B" />
      <g><circle cx="60" cy="226" r="12" fill="#FBBF77" /><rect x="48" y="238" width="24" height="34" rx="10" fill="#2563EB" /><rect x="56" y="268" width="8" height="0" /></g>
      <g><circle cx="430" cy="226" r="12" fill="#F2B28C" /><rect x="418" y="238" width="24" height="34" rx="10" fill="#F59E0B" /></g>
      <rect x="20" y="236" width="40" height="30" rx="4" fill="none" /><g fill="#0B3D5F"><circle cx="40" cy="250" r="22" opacity=".0" /></g>
      <g><rect x="30" y="200" width="22" height="48" rx="11" fill="#0E86C7" opacity=".0" /><circle cx="448" cy="180" r="18" fill="#0E86C7" /><circle cx="466" cy="196" r="14" fill="#0B3D5F" /><rect x="445" y="196" width="6" height="60" fill="#8B5E34" /></g>
    </svg>
  )
}

const DEMO: { r: Role; l: string; icon: React.ReactNode }[] = [
  { r: 'siswa', l: 'Masuk sebagai Siswa', icon: <GraduationCap size={18} /> }, { r: 'guru', l: 'Masuk sebagai Guru', icon: <BookMarked size={18} /> },
  { r: 'wali', l: 'Masuk sebagai Wali Kelas', icon: <Users size={18} /> }, { r: 'kepsek', l: 'Masuk sebagai Kepala Sekolah', icon: <Crown size={18} /> }, { r: 'tu', l: 'Masuk sebagai Tata Usaha', icon: <School size={18} /> },
]
export function Login() {
  const { login } = useApp(); const nav = useNavigate()
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [show, setShow] = useState(false); const [rem, setRem] = useState(true)
  const [err, setErr] = useState(''); const [loading, setLoading] = useState<string | null>(null); const [fe, setFe] = useState<{ id?: string; pw?: string }>({})
  const go = (r: Role) => { setLoading(r); setTimeout(() => { login(r, null); nav(ROLES[r].base + (r === 'tu' ? '/dashboard' : '/beranda')) }, 700) }
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const f: typeof fe = {}
    if (!id.trim()) f.id = 'NIS / NIP / Email wajib diisi'; if (pw.length < 6) f.pw = 'Kata sandi minimal 6 karakter'; setFe(f); setErr('')
    if (Object.keys(f).length) return
    setLoading('form'); setTimeout(() => {
      setLoading(null); const m = id.toLowerCase()
      const r: Role | null = m === '2425010002' || m.includes('siswa') ? 'siswa' : m.includes('guru') || m === '198503122010012004' ? 'guru' : m.includes('wali') ? 'wali' : m.includes('kepsek') ? 'kepsek' : m.includes('tu') ? 'tu' : null
      if (r && pw === 'sekolah123') go(r); else setErr('NIS/NIP atau kata sandi tidak sesuai. Gunakan tombol demo di bawah untuk mencoba aplikasi.')
    }, 900)
  }
  const feats = [{ i: <FolderOpen />, t: 'Materi Terpusat', d: 'Semua materi pelajaran di satu tempat' }, { i: <BookMarked />, t: 'Tugas & Kuis Online', d: 'Kerjakan dan pantau nilai kapan saja' }, { i: <ClipboardCheck />, t: 'Presensi Digital', d: 'Rekap kehadiran akurat dan transparan' }]
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex flex-col justify-center items-center text-white p-12 bg-gradient-to-br from-[#0B3D5F] via-[#0E86C7] to-[#0B3D5F] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10" /><div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-white/10" />
        <div className="relative max-w-lg w-full flex flex-col items-center text-center">
          <SchoolIllustration />
          <h1 className="text-[32px] leading-tight font-extrabold mt-6">Sistem Pembelajaran Digital SMK Negeri 2 Indramayu</h1>
          <p className="text-white/90 mt-3 text-lg">Belajar lebih terarah, mengajar lebih mudah, sekolah lebih terhubung.</p>
          <ul className="mt-8 space-y-3 w-full text-left">{feats.map((f) => <li key={f.t} className="flex items-center gap-4 bg-white/15 rounded-2xl p-4 backdrop-blur"><span className="w-11 h-11 rounded-xl bg-white text-primary-dark flex items-center justify-center shrink-0">{f.i}</span><div><b className="block">{f.t}</b><span className="text-sm text-white/90">{f.d}</span></div></li>)}</ul>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8"><span className="bg-primary rounded-full"><Logo /></span><div className="leading-tight"><b className="block">SMK Negeri 2 Indramayu</b><span className="text-sm text-muted">Sistem Pembelajaran Digital</span></div></div>
          <h2 className="text-[28px] font-extrabold">Selamat Datang</h2><p className="text-muted mt-1 mb-6">Masuk untuk melanjutkan ke ruang belajarmu.</p>
          {err && <div role="alert" className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-sm mb-4"><AlertCircle size={18} className="shrink-0 mt-0.5" />{err}</div>}
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input label="NIS / NIP / Email" placeholder="Masukkan NIS, NIP, atau email" value={id} onChange={(e) => setId(e.target.value)} error={fe.id} icon={<User size={18} />} />
            <Field label="Kata Sandi" error={fe.pw}><div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Masukkan kata sandi" className={cn('w-full h-11 rounded-xl border pl-10 pr-11 text-sm outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary', fe.pw ? 'border-danger' : 'border-line')} />
              <button type="button" aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} className="w-4 h-4 accent-[#0B3D5F]" />Ingat saya</label><Link to="/lupa-sandi" className="text-accent font-semibold hover:underline">Lupa kata sandi?</Link></div>
            <Btn type="submit" full loading={loading === 'form'} className="!h-11">Masuk</Btn>
          </form>
          <div className="flex items-center gap-3 my-6 text-xs font-bold text-muted uppercase tracking-wider"><span className="flex-1 h-px bg-line" />Demo<span className="flex-1 h-px bg-line" /></div>
          <div className="grid gap-2.5">{DEMO.map((d) => <Btn key={d.r} variant="outline" full icon={d.icon} loading={loading === d.r} disabled={!!loading} onClick={() => go(d.r)} className="!justify-start">{d.l}</Btn>)}</div>
        </div>
      </section>
    </div>
  )
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-light to-gray-100"><div className="w-full max-w-md bg-white rounded-[20px] shadow-lift border border-line p-8 pop"><div className="flex items-center gap-3 mb-6"><span className="bg-primary rounded-full"><Logo size={40} /></span><b className="text-sm leading-tight">SMK Negeri 2 Indramayu<br /><span className="text-muted font-normal">Sistem Pembelajaran Digital</span></b></div>{children}</div></div>
}
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
export function strength(p: string) { let s = 0; if (p.length >= 8) s++; if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return s }
export function PasswordForm({ onDone }: { onDone: () => void }) {
  const [o, setO] = useState(''); const [n, setN] = useState(''); const [c, setC] = useState(''); const [e, setE] = useState<Record<string, string>>({}); const [l, setL] = useState(false)
  const s = strength(n); const lbl = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][n ? s : 0]; const col = ['bg-gray-300', 'bg-danger', 'bg-warn', 'bg-accent', 'bg-primary'][n ? s : 0]
  const submit = (ev: React.FormEvent) => { ev.preventDefault(); const x: Record<string, string> = {}; if (!o) x.o = 'Kata sandi lama wajib diisi'; if (s < 3) x.n = 'Kata sandi baru minimal 8 karakter dengan huruf besar, kecil, dan angka'; if (c !== n) x.c = 'Konfirmasi tidak sama dengan kata sandi baru'; setE(x); if (Object.keys(x).length) return; setL(true); setTimeout(() => { setL(false); onDone() }, 800) }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input label="Kata Sandi Lama" type="password" value={o} onChange={(x) => setO(x.target.value)} error={e.o} />
      <div><Input label="Kata Sandi Baru" type="password" value={n} onChange={(x) => setN(x.target.value)} error={e.n} />
        <div className="mt-2 flex gap-1.5">{[1, 2, 3, 4].map((i) => <span key={i} className={cn('h-1.5 flex-1 rounded-full', n && i <= s ? col : 'bg-gray-200')} />)}</div><div className="text-xs mt-1 text-muted">Kekuatan: <b className="text-ink">{lbl}</b></div></div>
      <Input label="Konfirmasi Kata Sandi Baru" type="password" value={c} onChange={(x) => setC(x.target.value)} error={e.c} />
      <Btn type="submit" loading={l} full icon={<ShieldCheck size={18} />}>Simpan Kata Sandi</Btn>
    </form>
  )
}
export function GantiSandi() {
  const nav = useNavigate(); const { toast, role } = useApp()
  return <AuthShell><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><Lock /></span><h2 className="text-2xl font-extrabold mt-4">Ganti Kata Sandi</h2><p className="text-muted mt-1 mb-5">Gunakan kombinasi huruf besar, kecil, angka, dan simbol agar akunmu aman.</p>
    <PasswordForm onDone={() => { toast('Kata sandi berhasil diubah'); nav(role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login') }} /><Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali</Link></AuthShell>
}
export function NotFound() {
  const { role } = useApp()
  return <div className="min-h-screen flex items-center justify-center p-6 text-center"><div className="max-w-md"><svg viewBox="0 0 240 160" className="w-72 mx-auto" aria-hidden><circle cx="120" cy="84" r="66" fill="#E8F6EC" /><text x="120" y="100" textAnchor="middle" fontSize="64" fontWeight="800" fill="#0B3D5F">404</text><rect x="70" y="112" width="100" height="8" rx="4" fill="#BBE5C6" /><circle cx="40" cy="40" r="6" fill="#F59E0B" /><circle cx="205" cy="60" r="5" fill="#2563EB" /></svg>
    <h1 className="text-3xl font-extrabold mt-4">Halaman Tidak Ditemukan</h1><p className="text-muted mt-2">Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.</p>
    <Btn to={role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login'} className="mt-6 !px-6">Kembali ke Beranda</Btn></div></div>
}
export { QrCode }
