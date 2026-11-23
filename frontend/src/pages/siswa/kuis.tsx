import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flag, LogOut, Play, Send, Timer, XCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Btn, Card, CardTitle, PageHeader, Ring, cn, useCrumbs } from '@/components/ui'
import { Logo } from '@/components/layouts'
import { useApp } from '@/context'
import { fmtBatas, kuisById, kuisSoalOf, offeringById, offeringTitle } from '@/mocks'

export function KuisInstruksi() {
  const { id } = useParams(); const k = kuisById(id!); const o = offeringById(k.off); const nav = useNavigate(); const can = k.status === 'Tersedia'
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis', to: '/siswa/tugas?tab=kuis' }, { l: 'Instruksi Kuis' })} title={k.judul} subtitle={offeringTitle(o)} actions={<Btn variant="outline" icon={<ArrowLeft size={18} />} to="/siswa/tugas?tab=kuis">Kembali</Btn>} />
      <div className="grid lg:grid-cols-[1fr_380px] gap-6"><Card><h3 className="font-bold text-lg mb-3">Petunjuk Pengerjaan</h3><ol className="list-decimal pl-5 space-y-2 leading-7"><li>Kuis terdiri dari {k.soal} soal pilihan ganda dengan satu jawaban benar.</li><li>Waktu pengerjaan {k.durasi} menit. Timer berjalan otomatis setelah kamu menekan Mulai Kuis.</li><li>Kamu dapat berpindah antar soal dan menandai soal sebagai Ragu-ragu.</li><li>Jawaban akan dikumpulkan otomatis ketika waktu habis.</li><li>Jangan menutup atau memuat ulang halaman selama kuis berlangsung.</li><li>Kerjakan secara jujur dan mandiri.</li></ol></Card>
        <Card><h3 className="font-bold text-lg mb-4">Informasi Kuis</h3><dl className="space-y-3 text-sm">{[['Durasi', `${k.durasi} menit`], ['Jumlah Soal', `${k.soal} soal`], ['Dibuka', fmtBatas(k.buka)], ['Ditutup', fmtBatas(k.tutup)], ['Percobaan', `${k.dipakai} dari ${k.percobaan} digunakan`]].map(([a, b]) => <div key={a} className="flex justify-between gap-3"><dt className="text-muted">{a}</dt><dd className="font-bold text-right">{b}</dd></div>)}</dl>
          <Btn full className="mt-6 !h-11" disabled={!can} icon={<Play size={18} />} onClick={() => { sessionStorage.removeItem(`quiz-${k.id}`); nav(`/siswa/kuis/${k.id}/kerjakan`) }}>{can ? 'Mulai Kuis' : k.status}</Btn></Card></div></div>
  )
}
export function KuisKerjakan() {
  const { id } = useParams(); const k = kuisById(id!); const nav = useNavigate(); const { confirm, toast } = useApp()
  const qs = useMemo(() => kuisSoalOf(id!), [id])
  const [i, setI] = useState(0); const [ans, setAns] = useState<(number | null)[]>(Array(qs.length).fill(null)); const [flag, setFlag] = useState<Set<number>>(new Set()); const [left, setLeft] = useState(k.durasi * 60)
  const done = useRef(false); const ansRef = useRef(ans); ansRef.current = ans
  const finish = (auto = false) => { if (done.current) return; done.current = true; sessionStorage.setItem(`quiz-${k.id}`, JSON.stringify({ ans: ansRef.current, used: k.durasi * 60 - left })); if (auto) toast('Waktu habis. Jawaban dikumpulkan otomatis.', 'warn'); nav(`/siswa/kuis/${k.id}/hasil`, { replace: true }) }
  useEffect(() => { const t = setInterval(() => setLeft((l) => l - 1), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (left <= 0) finish(true) }, [left])
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, '0'), ss = String(Math.max(0, left) % 60).padStart(2, '0'); const q = qs[i]; const warn = left < 60
  const unanswered = ans.filter((a) => a === null).length
  const submit = () => confirm({ title: 'Kumpulkan Jawaban?', message: unanswered ? `Masih ada ${unanswered} soal yang belum dijawab. Jawaban yang sudah dikumpulkan tidak dapat diubah.` : 'Semua soal sudah dijawab. Jawaban tidak dapat diubah setelah dikumpulkan.', okLabel: 'Ya, Kumpulkan', onOk: () => finish() })
  return (
    <div className="min-h-screen">
      <header className="bg-primary text-white h-16 sticky top-0 z-40 shadow"><div className="max-w-[1180px] mx-auto px-4 h-full flex items-center gap-4"><Logo size={36} /><div className="flex-1 min-w-0"><div className="font-extrabold truncate">{k.judul}</div><div className="text-xs text-white/90 truncate">{offeringTitle(offeringById(k.off))}</div></div>
        <div className={cn('flex items-center gap-2 px-4 h-10 rounded-xl font-extrabold text-lg tabular-nums', warn ? 'bg-danger animate-pulse' : 'bg-white/20')} role="timer" aria-label="Sisa waktu"><Timer size={20} />{mm}:{ss}</div>
        <button onClick={() => confirm({ title: 'Keluar dari Kuis?', message: 'Jawaban yang belum dikumpulkan akan hilang dan kuis dihitung sebagai percobaan.', okLabel: 'Ya, Keluar', danger: true, onOk: () => { done.current = true; nav('/siswa/tugas?tab=kuis') } })} className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 font-semibold flex items-center gap-2"><LogOut size={18} /><span className="hidden sm:inline">Keluar</span></button></div></header>
      {warn && <div role="alert" className="bg-danger text-white text-center text-sm font-bold py-2">Waktu tersisa kurang dari 1 menit! Jawaban akan dikumpulkan otomatis saat waktu habis.</div>}
      <main className="max-w-[1180px] mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <Card><div className="flex items-center justify-between mb-4"><Badge tone="blue">Soal {i + 1} dari {qs.length}</Badge><button onClick={() => setFlag((f) => { const n = new Set(f); n.has(i) ? n.delete(i) : n.add(i); return n })} className={cn('flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-bold border', flag.has(i) ? 'bg-amber-100 border-warn text-amber-800' : 'border-line text-muted hover:bg-gray-50')} aria-pressed={flag.has(i)}><Flag size={16} />Ragu-ragu</button></div>
          <h2 className="text-xl font-bold leading-8">{q.q}</h2>
          <div className="mt-6 space-y-3" role="radiogroup">{q.opsi.map((op, j) => { const on = ans[i] === j; return <button key={j} role="radio" aria-checked={on} onClick={() => setAns((a) => a.map((x, y) => (y === i ? j : x)))} className={cn('w-full flex items-center gap-4 text-left p-4 rounded-2xl border-2 transition', on ? 'border-primary bg-primary-light' : 'border-line hover:border-primary/50 hover:bg-gray-50')}><span className={cn('w-9 h-9 rounded-full flex items-center justify-center font-extrabold shrink-0', on ? 'bg-primary text-white' : 'bg-gray-100')}>{'ABCD'[j]}</span><span className="font-semibold">{op}</span></button> })}</div>
          <div className="flex justify-between mt-8"><Btn variant="outline" disabled={i === 0} icon={<ArrowLeft size={18} />} onClick={() => setI(i - 1)}>Sebelumnya</Btn>{i < qs.length - 1 ? <Btn onClick={() => setI(i + 1)}>Selanjutnya<ArrowRight size={18} /></Btn> : <Btn onClick={submit} icon={<Send size={18} />}>Kumpulkan</Btn>}</div></Card>
        <Card className="lg:sticky lg:top-24"><h3 className="font-bold mb-3">Navigasi Soal</h3><div className="grid grid-cols-5 gap-2">{ans.map((a, n) => <button key={n} onClick={() => setI(n)} aria-label={`Soal ${n + 1}`} className={cn('h-11 rounded-xl font-bold text-sm border-2 relative', n === i && 'ring-2 ring-ink ring-offset-2', flag.has(n) ? 'bg-warn border-warn text-white' : a !== null ? 'bg-primary border-primary text-white' : 'bg-white border-line text-ink')}>{n + 1}</button>)}</div>
          <ul className="mt-4 space-y-1.5 text-xs text-muted"><li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-primary" />Terjawab ({ans.filter((a) => a !== null).length})</li><li className="flex items-center gap-2"><span className="w-4 h-4 rounded border-2 border-line" />Belum dijawab ({unanswered})</li><li className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-warn" />Ditandai ({flag.size})</li></ul>
          <Btn full className="mt-5" onClick={submit} icon={<Send size={16} />}>Kumpulkan</Btn></Card></main>
    </div>
  )
}
export function KuisHasil() {
  const { id } = useParams(); const k = kuisById(id!); const raw = sessionStorage.getItem(`quiz-${k.id}`)
  const stored = raw ? JSON.parse(raw) : null
  const qs = useMemo(() => kuisSoalOf(id!), [id])
  const ans: (number | null)[] = stored ? stored.ans : qs.map((q, n) => (n < (k.skor ?? 80) / 10 ? q.kunci : (q.kunci + 1) % 4))
  const benar = ans.filter((a, n) => a === qs[n].kunci).length; const kosong = ans.filter((a) => a === null).length; const salah = qs.length - benar - kosong; const skor = Math.round((benar / qs.length) * 100)
  const used = stored ? stored.used : 14 * 60 + 20; const avg = 76
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis', to: '/siswa/tugas?tab=kuis' }, { l: 'Hasil Kuis' })} title={`Hasil: ${k.judul}`} subtitle={offeringTitle(offeringById(k.off))} actions={<Btn variant="outline" to="/siswa/tugas?tab=kuis">Kembali ke Kuis</Btn>} />
      <div className="grid lg:grid-cols-3 gap-6 mb-6"><Card className="text-center"><Ring value={skor} size={160} stroke={14} color={skor >= 75 ? '#0B3D5F' : '#F59E0B'} sub="Skor Kamu" /><p className="font-bold mt-3">{skor >= 75 ? 'Hebat, pertahankan!' : 'Ayo belajar lagi, kamu pasti bisa!'}</p></Card>
        <Card><h3 className="font-bold mb-4">Ringkasan</h3><div className="grid grid-cols-3 gap-3 text-center">{[['Benar', benar, 'bg-green-100 text-green-800'], ['Salah', salah, 'bg-red-100 text-red-800'], ['Kosong', kosong, 'bg-gray-100 text-gray-700']].map(([l, v, c]) => <div key={l as string} className={cn('rounded-2xl py-4', c as string)}><div className="text-3xl font-extrabold">{v}</div><div className="text-xs font-bold">{l}</div></div>)}</div><div className="flex items-center gap-2 text-sm mt-4 text-muted"><Clock size={16} />Durasi pengerjaan: <b className="text-ink">{Math.floor(used / 60)} menit {used % 60} detik</b></div></Card>
        <Card><h3 className="font-bold mb-2">Perbandingan dengan Rata-rata Kelas</h3><div style={{ height: 150 }}><ResponsiveContainer><BarChart data={[{ n: 'Kamu', v: skor }, { n: 'Rata-rata Kelas', v: avg }]} barSize={48}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={12} /><YAxis domain={[0, 100]} hide /><Tooltip /><Bar dataKey="v" name="Skor" radius={[10, 10, 0, 0]}><Cell fill="#0B3D5F" /><Cell fill="#2563EB" /></Bar></BarChart></ResponsiveContainer></div></Card></div>
      <Card><CardTitle>Review Jawaban</CardTitle><ul className="space-y-4">{qs.map((q, n) => { const a = ans[n]; const ok = a === q.kunci
        return <li key={q.id} className={cn('border rounded-2xl p-4', ok ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/40')}><div className="flex items-start gap-3">{ok ? <CheckCircle2 className="text-ok shrink-0" /> : <XCircle className="text-danger shrink-0" />}<div className="flex-1"><b>{n + 1}. {q.q}</b><div className="grid sm:grid-cols-2 gap-2 mt-3">{q.opsi.map((op, j) => <div key={j} className={cn('text-sm px-3 py-2 rounded-xl border', j === q.kunci ? 'border-ok bg-green-100 font-bold' : j === a ? 'border-danger bg-red-100' : 'border-line bg-white')}>{'ABCD'[j]}. {op}{j === q.kunci && ' (Kunci)'}{j === a && j !== q.kunci && ' (Jawabanmu)'}</div>)}</div>{a === null && <p className="text-xs text-muted mt-2">Tidak dijawab</p>}</div></div></li> })}</ul></Card></div>
  )
}
