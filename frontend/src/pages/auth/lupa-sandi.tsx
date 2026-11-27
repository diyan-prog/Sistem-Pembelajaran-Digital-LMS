import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Btn, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { AuthShell } from './auth-shell'

type Step = 'email' | 'otp'

const emailValid = (value: string) => /^\S+@\S+\.\S+$/.test(value)

export function LupaSandi() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [err, setErr] = useState('')
  const [l, setL] = useState(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (timer <= 0) return
    const t = window.setTimeout(() => setTimer((v) => v - 1), 1000)
    return () => window.clearTimeout(t)
  }, [timer])

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const value = email.trim().toLowerCase()
    if (!emailValid(value)) return setErr('Masukkan alamat email yang valid')

    setErr('')
    setL(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/ganti-sandi`,
      },
    })
    setL(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('not found') || msg.includes('signups not allowed')) {
        return setErr('Email tidak terdaftar. Hubungi tata usaha bila akun belum dibuat.')
      }
      if (msg.includes('rate limit') || msg.includes('too many')) {
        return setErr('Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.')
      }
      return setErr('Gagal mengirim kode OTP. Coba lagi.')
    }

    setEmail(value)
    setOtp('')
    setStep('otp')
    setTimer(60)
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) return setErr('Masukkan kode OTP 6 digit')

    setErr('')
    setL(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setL(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('expired')) return setErr('Kode OTP sudah kedaluwarsa. Minta kode baru.')
      return setErr('Kode OTP salah atau sudah kedaluwarsa. Periksa kembali email Anda.')
    }

    nav('/ganti-sandi', { replace: true })
  }

  if (step === 'otp') {
    return (
      <AuthShell>
        <span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><ShieldCheck /></span>
        <h2 className="text-2xl font-extrabold mt-4">Verifikasi Kode OTP</h2>
        <p className="text-muted mt-1 mb-5">Masukkan kode 6 digit yang dikirim ke <b className="text-ink">{email}</b>. Kode berlaku selama 10 menit.</p>
        <form onSubmit={verifyOtp} className="space-y-4" noValidate>
          <Input
            label="Kode OTP"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr('') }}
            error={err}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            icon={<ShieldCheck size={18} />}
          />
          <Btn type="submit" full loading={l}>Verifikasi Kode</Btn>
        </form>
        <div className="mt-4 space-y-3">
          <Btn type="button" variant="outline" full loading={l} disabled={timer > 0} onClick={() => sendOtp()}>
            {timer > 0 ? `Kirim ulang dalam ${timer} detik` : 'Kirim Ulang Kode'}
          </Btn>
          <button
            type="button"
            onClick={() => { setStep('email'); setErr(''); setOtp(''); setTimer(0) }}
            className="w-full text-sm font-semibold text-muted hover:text-ink"
          >
            Ubah alamat email
          </button>
        </div>
        <p className="text-xs text-muted mt-4">Tidak menemukan kode? Periksa folder spam. Jika email hanya berisi tautan, klik tautan tersebut untuk melanjutkan.</p>
        <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali ke halaman masuk</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <span className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center"><KeyRound /></span>
      <h2 className="text-2xl font-extrabold mt-4">Lupa Kata Sandi</h2>
      <p className="text-muted mt-1 mb-5">Masukkan email terdaftar. Kami akan mengirim kode OTP untuk mengatur kata sandi baru.</p>
      <form onSubmit={sendOtp} className="space-y-4" noValidate>
        <Input
          label="Email Terdaftar"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr('') }}
          error={err}
          icon={<Mail size={18} />}
          autoComplete="email"
          placeholder="contoh: rina.aulia@siswa.smkn2indramayu.sch.id"
        />
        <Btn type="submit" full loading={l}>Kirim Kode OTP</Btn>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} />Kembali ke halaman masuk</Link>
    </AuthShell>
  )
}
