import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, BookMarked, CheckCircle2, ClipboardCheck, Crown, Eye, EyeOff, FolderOpen, GraduationCap, Lock, School, User, Users } from 'lucide-react'
import { Btn, Field, Input, cn } from '@/components/ui'
import { Logo } from '@/components/layouts'
import { ROLES, type Role } from '@/lib/roles'
import { useApp } from '@/context'
import { SchoolIllustration } from './school-illustration'

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
