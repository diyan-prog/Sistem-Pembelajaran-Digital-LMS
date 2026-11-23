import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Btn, Input, cn } from '@/components/ui'

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
