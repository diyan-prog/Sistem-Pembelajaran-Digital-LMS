import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, BookMarked, BookOpen, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, FileText, Flag, HelpCircle, LogOut, MapPin, Paperclip, Play, Repeat, Timer, Trophy, User, XCircle, ClipboardList, Megaphone, Send, Undo2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Accordion, Badge, Btn, Card, CardTitle, Chips, ClassCard, DataTable, Dropzone, Empty, FileIcon, Progress, PageHeader, Ring, SearchBar, Select, StatusBadge, Tabs, Textarea, cn, fileTone, useCountdown, useCrumbs, useTab, download, Modal } from '@/components/ui'
import { Logo } from '@/components/layouts'
import { ScheduleCard, ClassBrowser } from './shared'
import { useApp } from '@/context'
import { ME_SISWA, absensiSiswa, fmtBatas, fmtSlot, jurusanNama, kelasById, kuis, kuisById, kuisSoal, kuisSoalOf, materiOf, nilaiSiswa, offeringById, offeringTitle, pct, pengumuman, sesiOf, siswaOfferings, subjectById, teacherById, trenNilaiBulan, tugas, tugasById, fmtTglPendek, type Offering, type Tugas, type Kuis, offerings } from '@/data'

const deadlineOf = (iso: string) => fmtBatas(iso).replace(/(\d{2})\.(\d{2})$/, '$1.$2')
const shortBatas = (iso: string) => `Batas: ${deadlineOf(iso)}`

export function ClassHeader({ o, mode }: { o: Offering; mode: 'siswa' | 'guru' }) {
  const p = pct(o); const k = kelasById(o.kelasId); const g = teacherById(o.guru)
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] leading-9 font-extrabold uppercase">{offeringTitle(o)}</h1><p className="font-semibold mt-1">{jurusanNama(k.jurusan)} • <span className="italic font-normal text-muted">{o.semester}</span></p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
            <div className="flex items-center gap-2"><User size={16} className="text-muted" />{g.sapaan}{o.co.length > 0 && <span className="text-accent underline">dan {o.co.length} lainnya</span>}</div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-muted" />Ruang {o.jadwal[0].ruang}</div>
            <div className="flex items-center gap-2 sm:col-span-2"><Calendar size={16} className="text-muted" />{o.jadwal.map(fmtSlot).join(' • ')}</div>
          </div>
        </div>
        <div className="w-full sm:w-72 bg-gray-50 rounded-2xl p-4">
          {mode === 'siswa' ? <><div className="flex justify-between text-sm font-semibold"><span>Kehadiran: {o.hadir} dari {o.done} sesi</span><span className="font-extrabold">{p}%</span></div><Progress value={p} className="mt-2" /></>
            : <><div className="flex justify-between text-sm font-semibold"><span>Pertemuan: {o.done} dari {o.total} sesi</span><span className="font-extrabold">{Math.round((o.done / o.total) * 100)}%</span></div><Progress value={(o.done / o.total) * 100} className="mt-2" /><div className="text-sm mt-3 font-semibold">Rata-rata nilai kelas: <span className="text-primary-dark">{o.rata}</span></div></>}
        </div>
      </div>
    </Card>
  )
}
export const classAnn = (o: Offering) => [
  { id: 'a1', t: `Persiapan pertemuan berikutnya: ${subjectById(o.subjectId).nama}`, d: 'Harap membaca modul pada tab Materi sebelum pertemuan berikutnya dan membawa perangkat belajar masing-masing.', w: '28 Okt 2026' },
  { id: 'a2', t: 'Pengingat pengumpulan tugas', d: 'Tugas harus dikumpulkan sebelum batas waktu melalui sistem. Keterlambatan akan ditandai otomatis.', w: '26 Okt 2026' },
  { id: 'a3', t: 'Jadwal kuis bab berjalan', d: 'Kuis akan dibuka selama beberapa hari dengan waktu pengerjaan terbatas. Pastikan koneksi internet stabil.', w: '22 Okt 2026' },
]

export function YtThumb({ id, className }: { id: string; className?: string }) {
  const [ok, setOk] = useState(true)
  return <div className={cn('relative bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center overflow-hidden', className)}>{ok && <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" onError={() => setOk(false)} className="absolute inset-0 w-full h-full object-cover" />}<span className="relative w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow"><Play className="text-danger fill-danger ml-0.5" size={22} /></span></div>
}

export function MateriList({ offId }: { offId: string }) {
  const { toast } = useApp(); const nav = useNavigate(); const ps = materiOf(offId)
  return <Accordion defaultOpen={ps.length - 1} items={ps.map((p) => ({ id: p.id, title: <span className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center text-sm font-extrabold">{p.no}</span><span><span className="block">Pertemuan {p.no}: {p.judul}</span><span className="block text-xs text-muted font-normal">{p.tanggal} • {p.items.length} materi</span></span></span>,
    body: <ul className="space-y-3 pt-3">{p.items.map((m) => m.tipe === 'youtube' ? (
      <li key={m.id} className="flex flex-col sm:flex-row gap-4 border border-line rounded-2xl p-3"><YtThumb id={m.yt!} className="w-full sm:w-48 h-28 rounded-xl shrink-0" /><div className="flex-1 flex flex-col"><div className="font-bold">{m.judul}</div><div className="text-xs text-muted mt-1 flex items-center gap-2"><FileIcon t="youtube" size={14} />Tautan YouTube • {m.tanggal}</div><div className="mt-auto pt-3"><Btn variant="outline" className="!h-9" icon={<Eye size={16} />} onClick={() => nav(`${useBase()}/kelas/${offId}/materi/${m.id}`)}>Pratinjau</Btn></div></div></li>
    ) : (
      <li key={m.id} className="flex flex-wrap items-center gap-4 border border-line rounded-2xl p-3"><span className={cn('w-11 h-11 rounded-xl flex items-center justify-center', fileTone(m.tipe))}><FileIcon t={m.tipe} /></span><div className="flex-1 min-w-[180px]"><div className="font-bold text-sm">{m.judul}</div><div className="text-xs text-muted">{m.ext} • {m.ukuran} • Diunggah {m.tanggal}</div></div>
        <Btn variant="outline" className="!h-9" icon={<Eye size={16} />} onClick={() => nav(`${useBase()}/kelas/${offId}/materi/${m.id}`)}>Pratinjau</Btn><Btn className="!h-9" icon={<Download size={16} />} onClick={() => { download(m.judul + '.txt'); toast(`Mengunduh ${m.judul}`, 'info') }}>Unduh</Btn></li>))}</ul> }))} />
}
const useBase = () => '/siswa'

export function MateriPreview() {
  const { id, mid } = useParams(); const nav = useNavigate(); const { toast } = useApp(); const base = '/siswa'
  const ps = materiOf(id!); const flat = ps.flatMap((p) => p.items.map((m) => ({ ...m, p }))); const i = flat.findIndex((m) => m.id === mid); const m = flat[i]
  const o = offeringById(id!)
  if (!m) return <Card><Empty title="Materi tidak ditemukan" action={<Btn to={`${base}/kelas/${id}`}>Kembali ke kelas</Btn>} /></Card>
  return (
    <div>
      <PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: `${base}/kelas` }, { l: subjectById(o.subjectId).nama, to: `${base}/kelas/${id}?tab=materi` }, { l: 'Pratinjau Materi' })} title={m.judul} subtitle={`Pertemuan ${m.p.no}: ${m.p.judul}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to={`${base}/kelas/${id}?tab=materi`}>Kembali</Btn>{m.tipe !== 'youtube' && <Btn icon={<Download size={18} />} onClick={() => { download(m.judul + '.txt'); toast('Unduhan dimulai', 'info') }}>Unduh</Btn>}</>} />
      <Card pad={false} className="overflow-hidden">
        <div className="bg-gray-100 p-4 sm:p-8 flex justify-center">
          {m.tipe === 'youtube' ? <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black"><iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${m.yt}`} title={m.judul} allowFullScreen /></div>
            : m.tipe === 'gambar' ? <svg viewBox="0 0 640 400" className="w-full max-w-3xl rounded-2xl bg-white shadow-soft"><rect width="640" height="400" fill="#E8F6EC" /><rect x="60" y="60" width="200" height="120" rx="16" fill="#fff" stroke="#0B3D5F" strokeWidth="3" /><rect x="380" y="60" width="200" height="120" rx="16" fill="#fff" stroke="#2563EB" strokeWidth="3" /><rect x="220" y="240" width="200" height="100" rx="16" fill="#fff" stroke="#F59E0B" strokeWidth="3" /><path d="M260 120h120M320 180v60" stroke="#6B7280" strokeWidth="3" strokeDasharray="6" /><text x="160" y="126" textAnchor="middle" fontWeight="800" fill="#0E86C7" fontSize="20">Konsep</text><text x="480" y="126" textAnchor="middle" fontWeight="800" fill="#2563EB" fontSize="20">Praktik</text><text x="320" y="296" textAnchor="middle" fontWeight="800" fill="#B45309" fontSize="20">Evaluasi</text></svg>
              : <div className="w-full max-w-2xl bg-white rounded-xl shadow-soft p-10 min-h-[520px]"><div className="text-xs text-muted mb-6 flex justify-between"><span>SMK Negeri 2 Indramayu</span><span>Halaman 1 / 8</span></div><h2 className="text-2xl font-extrabold">{m.judul}</h2><p className="text-sm text-muted mt-1">Modul Pembelajaran • {subjectById(o.subjectId).nama}</p><div className="mt-6 space-y-3">{[100, 96, 92, 100, 70, 98, 94, 60, 100, 88].map((w, k) => <div key={k} className="h-3 rounded bg-gray-200" style={{ width: `${w}%` }} />)}</div><div className="mt-8 h-32 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark font-bold">Ilustrasi Materi</div><div className="mt-8 space-y-3">{[96, 90, 100, 74].map((w, k) => <div key={k} className="h-3 rounded bg-gray-200" style={{ width: `${w}%` }} />)}</div></div>}
        </div>
        <div className="flex items-center justify-between p-4 border-t border-line">
          <Btn variant="outline" disabled={i === 0} icon={<ChevronLeft size={18} />} onClick={() => nav(`${base}/kelas/${id}/materi/${flat[i - 1].id}`)}>Sebelumnya</Btn>
          <span className="text-sm text-muted font-semibold">Materi {i + 1} dari {flat.length}</span>
          <Btn variant="outline" disabled={i === flat.length - 1} onClick={() => nav(`${base}/kelas/${id}/materi/${flat[i + 1].id}`)}>Berikutnya<ChevronRight size={18} /></Btn></div>
      </Card>
    </div>
  )
}

// ---------- baris tugas/kuis ----------
const tugasIcon = (s: string) => s === 'Dinilai' ? 'bg-primary-light text-primary-dark' : s === 'Terlambat' ? 'bg-orange-100 text-orange-700' : s === 'Dikumpulkan' ? 'bg-blue-100 text-accent' : 'bg-gray-100 text-muted'
import { fetchPengumuman, type Pengumuman } from '@/services/pengumuman'
import { fetchTugas, fetchKuis } from '@/services/materi'
import { supabase } from '@/lib/supabase'

export function PerluDikerjakan({ limit }: { limit?: number }) {
  const { userData, toast } = useApp()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!userData?.id) return
    try {
      const [ts, ks] = await Promise.all([
        supabase.from('tugas').select('*, pengampu(subjects(name))'),
        supabase.from('kuis').select('*, pengampu(subjects(name))')
      ])
      
      const all = [
        ...(ts.data || []).map(t => ({ k: 'tugas', id: t.id_tugas, judul: t.judul, off: t.id_pengampu, batas: t.deadline, mapel: t.pengampu?.subjects?.name })),
        ...(ks.data || []).map(k => ({ k: 'kuis', id: k.id_kuis, judul: k.judul, off: k.id_pengampu, batas: k.waktu_selesai, mapel: k.pengampu?.subjects?.name }))
      ].sort((a, b) => a.batas.localeCompare(b.batas))
      
      setItems(all)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    const c1 = supabase.channel('tugas-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tugas' }, fetch).subscribe()
    const c2 = supabase.channel('kuis-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'kuis' }, fetch).subscribe()
    return () => { supabase.removeChannel(c1); supabase.removeChannel(c2) }
  }, [userData?.id])

  if (loading) return <Card><div className="animate-pulse h-40 bg-gray-100 rounded-2xl" /></Card>

  return (
    <Card>
      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold flex items-center gap-2">Perlu Dikerjakan<span className="min-w-6 h-6 px-2 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">{items.length}</span></h3><Link to="/siswa/tugas" className="text-sm font-bold text-accent hover:underline">Lihat Semua</Link></div>
      {items.length === 0 ? <Empty title="Semua beres!" text="Tidak ada tugas atau kuis yang perlu dikerjakan." /> : <ul className="space-y-1">{items.slice(0, limit ?? 5).map((t) => (
        <li key={t.id}><Link to={t.k === 'tugas' ? `/siswa/tugas/${t.id}` : `/siswa/kuis/${t.id}`} className="flex gap-3 p-3 -mx-3 rounded-2xl hover:bg-gray-50"><span className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', t.k === 'kuis' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-accent')}>{t.k === 'kuis' ? <HelpCircle size={19} /> : <ClipboardList size={19} />}</span>
          <span className="min-w-0"><span className="block font-bold text-sm leading-snug">{t.judul}</span><span className="block text-xs text-muted uppercase mt-0.5">{t.mapel}</span><span className="block text-xs text-danger font-semibold mt-1">{shortBatas(t.batas)}</span></span></Link></li>))}</ul>}
    </Card>
  )
}


import { fetchSiswaClasses } from '@/services/siswa'
import { fromPengampuToOffering } from '@/services/akademik'

export function SiswaBeranda() {
  const { userData } = useApp()
  const [news, setNews] = useState<Pengumuman[]>([])
  const [offerings, setOfferings] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [n, sc] = await Promise.all([
          fetchPengumuman('siswa'),
          userData?.id ? fetchSiswaClasses(userData.id) : Promise.resolve([])
        ])
        setNews(n.slice(0, 3))
        
        // Fallback: If DB returns empty schedule or empty classes, map local mock data to keep UI functional
        if (!sc || sc.length === 0) {
          setOfferings(siswaOfferings('k2'))
        } else {
          const offs = sc.flatMap((item: any) => {
            const cls = item.classes
            if (!cls || !cls.pengampu) return []
            const pengampus = Array.isArray(cls.pengampu) ? cls.pengampu : [cls.pengampu]
            return pengampus.map((p: any) => ({
              id: p.id_pengampu,
              kelasId: cls.id,
              subjectId: p.id_mapel,
              kode: cls.name,
              guru: p.id_guru,
              co: [],
              jadwal: [{ hari: (new Date()).getDay() || 1, mulai: '07.00', selesai: '08.40', ruang: 'R.501', mode: 'Offline', sesi: 1 }],
              done: 10,
              total: 32,
              hadir: 8,
              rata: 85,
              semester: '2026/2027',
              arsip: false
            }))
          })
          setOfferings(offs.length > 0 ? offs : siswaOfferings('k2'))
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setOfferings(siswaOfferings('k2'))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    const channel = supabase.channel('news-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'pengumuman' }, fetchAll).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userData?.id])

  return (
    <div>
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="space-y-6"><ScheduleCard offs={offerings} mode="siswa" loading={loading} /><PerluDikerjakan /></div>
        <div className="space-y-8 min-w-0"><ClassBrowser mode="siswa" to="/siswa/kelas" />
          <Card><CardTitle icon={<Megaphone size={20} className="text-primary" />} right={<Link to="/siswa/pengumuman" className="text-sm font-bold text-accent hover:underline">Lihat Semua</Link>}>Pengumuman Terbaru</CardTitle>
            <ul className="divide-y divide-line">{news.map((p) => <li key={p.id}><Link to={`/siswa/pengumuman/${p.id}`} className="flex items-start gap-3 py-3 hover:text-primary-dark"><div className="flex-1"><div className="font-bold text-sm">{p.judul}</div><div className="text-xs text-muted mt-0.5">{p.dibuat_oleh} • {p.created_at ? fmtTglPendek(new Date(p.created_at)) : ''}</div></div>{p.penting && <Badge tone="red">Penting</Badge>}</Link></li>)}</ul></Card></div>
      </div>
    </div>
  )
}

export function SiswaKelasSaya() {
  return <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya' })} title="Kelas Saya" subtitle="Semua kelas mata pelajaran yang kamu ikuti" /><ClassBrowser mode="siswa" withFilter to="/siswa/kelas" /></div>
}

function TugasRow({ t }: { t: Tugas }) {
  const o = offeringById(t.off)
  return <Link to={`/siswa/tugas/${t.id}`} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50 border-b border-line last:border-0"><span className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', tugasIcon(t.status))}><ClipboardList size={20} /></span><div className="flex-1 min-w-[200px]"><div className="font-bold">{t.judul}</div><div className="text-xs text-muted uppercase mt-0.5">{offeringTitle(o)}</div></div><div className="text-sm text-muted w-52">{shortBatas(t.batas)}</div><StatusBadge s={t.status} /><div className="w-16 text-right font-extrabold">{t.nilai ?? '-'}</div></Link>
}
export function KuisCard({ k, base = '/siswa' }: { k: Kuis; base?: string }) {
  const o = offeringById(k.off); const can = k.status === 'Tersedia'
  return <Card hover className="!p-5 flex flex-col" onClick={() => {}}><div className="flex items-start justify-between gap-2"><div><h4 className="font-bold text-[17px]">{k.judul}</h4><p className="text-xs text-muted uppercase mt-0.5">{offeringTitle(o)}</p></div><StatusBadge s={k.status} /></div>
    <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm text-muted"><span className="flex items-center gap-1.5"><Timer size={15} />{k.durasi} menit</span><span className="flex items-center gap-1.5"><HelpCircle size={15} />{k.soal} soal</span><span className="flex items-center gap-1.5"><Repeat size={15} />{k.dipakai}/{k.percobaan} percobaan</span><span className="flex items-center gap-1.5">{k.skor != null ? <><Trophy size={15} />Skor {k.skor}</> : null}</span></div>
    <div className="text-xs text-muted mt-3 flex items-center gap-1.5"><Clock size={14} />Buka {fmtTglPendek(new Date(k.buka))} • Tutup {fmtBatas(k.tutup).split(', ').slice(1).join(', ')}</div>
    <div className="mt-4 pt-4 border-t border-line flex gap-2">{can ? <Btn to={`${base}/kuis/${k.id}`} icon={<Play size={16} />}>Mulai Kuis</Btn> : k.status === 'Selesai' ? <Btn variant="outline" to={`${base}/kuis/${k.id}/hasil`}>Lihat Hasil</Btn> : <Btn disabled>{k.status === 'Belum Dibuka' ? 'Belum Dibuka' : 'Ditutup'}</Btn>}</div></Card>
}
export function TugasKuisPage() {
  const [tab, setTab] = useTab('tugas'); const [f, setF] = useState('Semua'); const [q, setQ] = useState(''); const [sort, setSort] = useState('Terdekat')
  const mine = tugas.filter((t) => offeringById(t.off).kelasId === 'k2'); const kz = kuis.filter((k) => offeringById(k.off).kelasId === 'k2')
  const st = ['Belum Dikumpulkan', 'Dikumpulkan', 'Terlambat', 'Dinilai']
  const list = mine.filter((t) => (f === 'Semua' || t.status === f) && (t.judul + subjectById(offeringById(t.off).subjectId).nama).toLowerCase().includes(q.toLowerCase())).sort((a, b) => (sort === 'Terdekat' ? 1 : -1) * a.batas.localeCompare(b.batas))
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis' })} title="Tugas & Kuis" subtitle="Pantau semua tugas dan kuis dari seluruh kelasmu" />
      <Tabs className="mb-6" tabs={[{ v: 'tugas', l: 'Tugas', n: mine.length }, { v: 'kuis', l: 'Kuis', n: kz.length }]} value={tab} onChange={setTab} />
      {tab === 'tugas' ? <div className="space-y-4">
        <Chips value={f} onChange={setF} options={[{ k: 'Semua', l: 'Semua', n: mine.length }, ...st.map((s) => ({ k: s, l: s, n: mine.filter((t) => t.status === s).length }))]} />
        <div className="flex flex-wrap gap-3"><SearchBar value={q} onChange={setQ} placeholder="Cari judul tugas atau mata pelajaran" className="w-96 max-w-full" /><Select aria-label="Urutkan" value={sort} onChange={(e) => setSort(e.target.value)} options={[{ v: 'Terdekat', l: 'Urutkan: batas terdekat' }, { v: 'Terjauh', l: 'Urutkan: batas terjauh' }]} className="w-56" /></div>
        <Card pad={false} className="overflow-hidden">{list.length ? list.map((t) => <TugasRow key={t.id} t={t} />) : <Empty title="Tugas tidak ditemukan" text="Ubah filter status atau kata kunci pencarian." />}</Card></div>
        : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{kz.map((k) => <KuisCard key={k.id} k={k} />)}</div>}
    </div>
  )
}

export function KelasDetailSiswa() {
  const { id } = useParams(); const o = offeringById(id!); const [tab, setTab] = useTab('beranda'); const nav = useNavigate()
  const mt = tugas.filter((t) => t.off === o.id); const mk = kuis.filter((k) => k.off === o.id)
  const sesi = useMemo(() => sesiOf(o.id), [o.id]); const nl = nilaiSiswa(ME_SISWA.id).find((n) => n.off.id === o.id)
  if (!o) return null
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: '/siswa/kelas' }, { l: subjectById(o.subjectId).nama })} title="Halaman Kelas" subtitle="Semua materi, tugas, kuis, kehadiran, dan nilai untuk kelas ini" />
      <ClassHeader o={o} mode="siswa" />
      <Tabs className="mb-6" tabs={[{ v: 'beranda', l: 'Beranda Kelas' }, { v: 'materi', l: 'Materi' }, { v: 'tugas', l: 'Tugas', n: mt.length }, { v: 'kuis', l: 'Kuis', n: mk.length }, { v: 'kehadiran', l: 'Kehadiran' }, { v: 'nilai', l: 'Nilai' }]} value={tab} onChange={setTab} />
      {tab === 'beranda' && <div className="grid lg:grid-cols-[1fr_380px] gap-6"><div className="space-y-4"><h3 className="text-[22px] font-bold">Pengumuman Kelas</h3>{classAnn(o).map((a) => <Card key={a.id}><div className="flex items-center gap-2 text-xs text-muted mb-1"><Megaphone size={14} />{teacherById(o.guru).sapaan} • {a.w}</div><h4 className="font-bold">{a.t}</h4><p className="text-sm text-muted mt-1 leading-6">{a.d}</p></Card>)}</div>
        <div className="space-y-6"><Card><CardTitle>Tugas & Kuis Mendatang</CardTitle>{[...mt.filter((t) => t.status === 'Belum Dikumpulkan').map((t) => ({ k: 'Tugas', j: t.judul, b: t.batas, to: `/siswa/tugas/${t.id}` })), ...mk.filter((k) => k.status !== 'Selesai' && k.status !== 'Ditutup').map((k) => ({ k: 'Kuis', j: k.judul, b: k.tutup, to: `/siswa/kuis/${k.id}` }))].map((x) => <Link key={x.j} to={x.to} className="flex gap-3 py-2.5 hover:text-primary-dark"><Badge tone={x.k === 'Kuis' ? 'amber' : 'blue'}>{x.k}</Badge><span className="flex-1 text-sm"><b className="block">{x.j}</b><span className="text-xs text-muted">{shortBatas(x.b)}</span></span></Link>)}
          {mt.every((t) => t.status !== 'Belum Dikumpulkan') && mk.every((k) => k.status === 'Selesai' || k.status === 'Ditutup') && <p className="text-sm text-muted">Tidak ada tugas atau kuis mendatang.</p>}</Card>
          <Card><CardTitle>Progress Materi</CardTitle><div className="flex justify-between text-sm font-semibold mb-2"><span>{Math.min(materiOf(o.id).length, Math.ceil(o.done / 2))} dari {materiOf(o.id).length} pertemuan dipelajari</span><span>{Math.round((Math.min(6, Math.ceil(o.done / 2)) / 6) * 100)}%</span></div><Progress value={(Math.min(6, Math.ceil(o.done / 2)) / 6) * 100} tone="green" className="!h-2.5" /></Card></div></div>}
      {tab === 'materi' && <div><h3 className="text-[22px] font-bold mb-4">Daftar Materi</h3><MateriList offId={o.id} /></div>}
      {tab === 'tugas' && <Card pad={false} className="overflow-hidden">{mt.length ? mt.map((t) => <TugasRow key={t.id} t={t} />) : <Empty title="Belum ada tugas" text="Tugas dari guru akan tampil di sini." />}</Card>}
      {tab === 'kuis' && (mk.length ? <div className="grid md:grid-cols-2 gap-5">{mk.map((k) => <KuisCard key={k.id} k={k} />)}</div> : <Card><Empty title="Belum ada kuis" text="Kuis dari guru akan tampil di sini." /></Card>)}
      {tab === 'kehadiran' && <div className="space-y-5"><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map((s) => <Card key={s} className="!p-4"><StatusBadge s={s} /><div className="text-2xl font-extrabold mt-2">{sesi.filter((x) => x.status === s).length}</div></Card>)}</div>
        <DataTable rows={sesi.map((s) => ({ ...s, id: s.no }))} pageSize={10} cols={[{ key: 'no', header: 'Sesi', sort: (r) => r.no, render: (r) => <b>Sesi {r.no}</b> }, { key: 'tgl', header: 'Tanggal', sort: (r) => r.tanggal.getTime(), render: (r) => r.tgl }, { key: 'jam', header: 'Jam' }, { key: 'materi', header: 'Materi' }, { key: 'status', header: 'Status', render: (r) => <StatusBadge s={r.status} /> }]} searchText={(r) => r.materi + r.status} searchPlaceholder="Cari materi atau status" /><p className="text-xs text-muted">Kehadiran dicatat oleh guru dan bersifat hanya-lihat.</p></div>}
      {tab === 'nilai' && <div className="grid lg:grid-cols-[1fr_340px] gap-6"><Card pad={false} className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-muted text-left"><tr><th className="p-4">Komponen</th><th>Jenis</th><th>Status</th><th className="text-right pr-4">Nilai</th></tr></thead><tbody>{[...mt.map((t) => ({ j: t.judul, k: 'Tugas', s: t.status, n: t.nilai })), ...mk.map((k) => ({ j: k.judul, k: 'Kuis', s: k.status, n: k.skor })), { j: 'Ujian Tengah Semester', k: 'UTS', s: 'Dinilai', n: nl?.uts }].map((r, i) => <tr key={i} className="border-t border-line h-14"><td className="p-4 font-semibold">{r.j}</td><td>{r.k}</td><td><StatusBadge s={r.s} /></td><td className="text-right pr-4 font-extrabold">{r.n ?? '-'}</td></tr>)}</tbody></table></Card>
        <Card className="text-center h-fit"><CardTitle>Nilai Akhir Sementara</CardTitle><Ring value={nl?.rata ?? 0} size={140} sub={`Predikat ${nl?.predikat}`} /><p className="text-sm text-muted mt-3">Bobot: tugas 30%, kuis 20%, UTS 30%, UAS 20%.</p></Card></div>}
      <span className="hidden">{nav.length}</span>
    </div>
  )
}

// ---------- Detail Tugas ----------
export function TugasDetail() {
  const { id } = useParams(); const t0 = tugasById(id!); const { toast, confirm } = useApp(); const o = offeringById(t0.off)
  const [status, setStatus] = useState(t0.status); const [uploaded, setUploaded] = useState(status === 'Dikumpulkan' || status === 'Dinilai' ? 1 : 0); const [note, setNote] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const batas = new Date(t0.batas); const cd = useCountdown(batas); const overdue = new Date(2026, 9, 29, 9, 30) > batas
  const submit = () => { if (!uploaded) return setErr('Unggah minimal satu berkas sebelum mengumpulkan'); setErr(''); setBusy(true); setTimeout(() => { setBusy(false); setStatus(overdue ? 'Terlambat' : 'Dikumpulkan'); toast('Tugas berhasil dikumpulkan') }, 800) }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis', to: '/siswa/tugas' }, { l: 'Detail Tugas' })} title={t0.judul} subtitle={offeringTitle(o)} actions={<Btn variant="outline" icon={<ArrowLeft size={18} />} to="/siswa/tugas">Kembali</Btn>} />
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        <Card><div className="flex flex-wrap gap-x-8 gap-y-3 text-sm pb-5 border-b border-line"><div><div className="text-xs text-muted">Mata Pelajaran</div><b>{subjectById(o.subjectId).nama}</b></div><div><div className="text-xs text-muted">Guru</div><b>{teacherById(o.guru).sapaan}</b></div><div><div className="text-xs text-muted">Batas Pengumpulan</div><b>{fmtBatas(t0.batas)}</b></div><div><div className="text-xs text-muted">Nilai Maksimal</div><b>{t0.maks}</b></div></div>
          <h3 className="font-bold text-lg mt-5 mb-2">Instruksi</h3><p className="whitespace-pre-line leading-7 text-[15px]">{t0.instruksi}</p>
          <h3 className="font-bold text-lg mt-6 mb-3">Lampiran Guru</h3><ul className="space-y-2">{t0.lampiran.map((l) => <li key={l.nama} className="flex items-center gap-3 border border-line rounded-xl p-3"><span className="w-10 h-10 rounded-xl bg-blue-100 text-accent flex items-center justify-center"><Paperclip size={18} /></span><div className="flex-1"><div className="font-semibold text-sm">{l.nama}</div><div className="text-xs text-muted">{l.ukuran}</div></div><Btn variant="outline" className="!h-9" icon={<Download size={16} />} onClick={() => { download(l.nama); toast('Mengunduh lampiran', 'info') }}>Unduh</Btn></li>)}</ul></Card>
        <div className="space-y-5 lg:sticky lg:top-24">
          <Card><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">Status Pengumpulan</h3><StatusBadge s={status} /></div>
            {status === 'Dinilai' ? <div className="text-center"><Ring value={t0.nilai ?? 0} size={130} sub={`dari ${t0.maks}`} /><div className="text-left mt-5 bg-primary-light rounded-2xl p-4"><div className="text-xs font-bold text-primary-dark uppercase">Umpan Balik Guru</div><p className="text-sm mt-1 leading-6">{t0.feedback}</p></div></div> : (<>
              {status === 'Belum Dikumpulkan' && !overdue && <div className="grid grid-cols-4 gap-2 text-center mb-4">{[['d', 'Hari'], ['h', 'Jam'], ['m', 'Menit'], ['s', 'Detik']].map(([k, l]) => <div key={k} className="bg-gray-50 rounded-xl py-2"><div className="text-xl font-extrabold">{String(cd[k as 'd']).padStart(2, '0')}</div><div className="text-[11px] text-muted">{l}</div></div>)}</div>}
              {overdue && status === 'Belum Dikumpulkan' && <div className="flex gap-2 bg-orange-50 text-orange-800 rounded-xl p-3 text-sm mb-4"><AlertTriangle size={18} />Batas waktu sudah lewat. Pengumpulan akan ditandai terlambat.</div>}
              {(status === 'Dikumpulkan' || status === 'Terlambat') ? <div className="space-y-3"><div className="flex items-center gap-3 border border-line rounded-xl p-3"><FileText className="text-accent" /><div className="flex-1 text-sm"><b>Jawaban-Rina-Aulia.pdf</b><div className="text-xs text-muted">Dikumpulkan 29 Okt 2026, 09.30</div></div><CheckCircle2 className="text-ok" /></div>
                {!overdue && <Btn variant="outline" full icon={<Undo2 size={16} />} onClick={() => confirm({ title: 'Batalkan Pengumpulan?', message: 'Berkas yang sudah dikumpulkan akan ditarik. Kamu dapat mengumpulkan ulang sebelum batas waktu.', okLabel: 'Ya, Batalkan', danger: true, onOk: () => { setStatus('Belum Dikumpulkan'); setUploaded(0); toast('Pengumpulan dibatalkan', 'info') } })}>Batalkan Pengumpulan</Btn>}</div>
                : <div className="space-y-4"><Dropzone multiple onDone={(n) => { setUploaded(n); setErr('') }} /><Textarea label="Catatan untuk guru (opsional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan singkat..." />{err && <p role="alert" className="text-danger text-xs font-semibold">{err}</p>}<Btn full loading={busy} icon={<Send size={16} />} onClick={submit}>Kumpulkan</Btn></div>}</>)}
          </Card></div></div></div>
  )
}

// ---------- Kuis ----------
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

// ---------- Nilai & Kehadiran ----------
export function NilaiKehadiran() {
  const [tab, setTab] = useTab('nilai'); const nl = nilaiSiswa(ME_SISWA.id); const ab = absensiSiswa(ME_SISWA.id)
  const tot = ab.reduce((a, b) => ({ hadir: a.hadir + b.hadir, izin: a.izin + b.izin, sakit: a.sakit + b.sakit, alpa: a.alpa + b.alpa, total: a.total + b.total }), { hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0 })
  const pie = [{ n: 'Hadir', v: tot.hadir, c: '#0B3D5F' }, { n: 'Izin', v: tot.izin, c: '#2563EB' }, { n: 'Sakit', v: tot.sakit, c: '#F59E0B' }, { n: 'Alpa', v: tot.alpa, c: '#DC2626' }]
  const riwayat = useMemo(() => siswaOfferings('k2').flatMap((o) => sesiOf(o.id).map((s) => ({ ...s, id: `${o.id}-${s.no}`, mapel: subjectById(o.subjectId).nama }))).sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime()), [])
  const pers = Math.round((tot.hadir / tot.total) * 100)
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Nilai & Kehadiran' })} title="Nilai & Kehadiran" subtitle={`${ME_SISWA.nama} • XI RPL 1 • Semester Ganjil 2026/2027`} />
      <Tabs className="mb-6" tabs={[{ v: 'nilai', l: 'Nilai' }, { v: 'kehadiran', l: 'Kehadiran' }]} value={tab} onChange={setTab} />
      {tab === 'nilai' ? <div className="space-y-6"><DataTable rows={nl.map((n) => ({ ...n, id: n.off.id }))} pageSize={10} cols={[{ key: 'mapel', header: 'Mata Pelajaran', sort: (r) => r.mapel, render: (r) => <b>{r.mapel}</b> }, { key: 'tugas', header: 'Tugas', sort: (r) => r.tugas }, { key: 'kuis', header: 'Kuis', sort: (r) => r.kuis }, { key: 'uts', header: 'UTS', sort: (r) => r.uts }, { key: 'rata', header: 'Rata-rata', sort: (r) => r.rata, render: (r) => <b>{r.rata}</b> }, { key: 'predikat', header: 'Predikat', render: (r) => <Badge tone={r.predikat === 'A' ? 'green' : r.predikat === 'B' ? 'blue' : r.predikat === 'C' ? 'amber' : 'red'}>{r.predikat}</Badge> }]} />
        <Card><CardTitle>Tren Nilai Rata-rata</CardTitle><div style={{ height: 280 }}><ResponsiveContainer><LineChart data={trenNilaiBulan}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="b" tickLine={false} axisLine={false} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="v" name="Rata-rata Nilai" stroke="#0B3D5F" strokeWidth={3} dot={{ r: 5, fill: '#0B3D5F' }} /></LineChart></ResponsiveContainer></div></Card></div>
        : <div className="space-y-6"><div className="grid lg:grid-cols-[360px_1fr] gap-6"><Card><CardTitle>Ringkasan Kehadiran</CardTitle><div className="relative" style={{ height: 240 }}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="v" nameKey="n" innerRadius={72} outerRadius={104} paddingAngle={3} cornerRadius={8}>{pie.map((p) => <Cell key={p.n} fill={p.c} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><div className="text-3xl font-extrabold">{pers}%</div><div className="text-xs text-muted">Hadir</div></div></div><div className="flex flex-wrap justify-center gap-3 text-xs">{pie.map((p) => <span key={p.n} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: p.c }} />{p.n} ({p.v})</span>)}</div></Card>
          <DataTable rows={ab.map((a) => ({ ...a, id: a.mapel }))} pageSize={10} cols={[{ key: 'mapel', header: 'Mata Pelajaran', sort: (r) => r.mapel, render: (r) => <b>{r.mapel}</b> }, { key: 'hadir', header: 'Hadir', sort: (r) => r.hadir }, { key: 'izin', header: 'Izin' }, { key: 'sakit', header: 'Sakit' }, { key: 'alpa', header: 'Alpa' }, { key: 'persen', header: 'Persentase', sort: (r) => r.persen, render: (r) => <div className="flex items-center gap-2 w-32"><Progress value={r.persen} tone={r.persen >= 75 ? 'green' : 'red'} className="flex-1" /><b>{r.persen}%</b></div> }]} /></div>
          <h3 className="text-[22px] font-bold">Riwayat Kehadiran</h3><DataTable rows={riwayat} pageSize={10} searchText={(r) => r.mapel + r.materi} searchPlaceholder="Cari mapel atau materi" cols={[{ key: 'tgl', header: 'Tanggal', sort: (r) => r.tanggal.getTime(), render: (r) => r.tgl }, { key: 'mapel', header: 'Mata Pelajaran', sort: (r) => r.mapel, render: (r) => <b>{r.mapel}</b> }, { key: 'jam', header: 'Jam' }, { key: 'materi', header: 'Materi' }, { key: 'status', header: 'Status', render: (r) => <StatusBadge s={r.status} /> }]} /><p className="text-xs text-muted">Data kehadiran bersifat hanya-lihat dan dikelola oleh guru.</p></div>}
    </div>
  )
}
export { offerings, Calendar, BookOpen, BookMarked, User, Chips, ClassCard, SearchBar, Modal }
