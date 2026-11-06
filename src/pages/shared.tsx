import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Calendar, Camera, Clock, CheckCheck, ClipboardList, List, LayoutGrid, MapPin, Megaphone, Pencil, Plus, Trash2, BookMarked, Bell, Award, FileText, CheckCircle2, Info, Palette, Type, Save, Users } from 'lucide-react'
import { Accordion, Avatar, Badge, Btn, Card, CardTitle, Chips, ClassCard, Empty, Input, PageHeader, SearchBar, Segmented, Select, Tabs, Textarea, Toggle, cn, Modal, useCrumbs, useTab, isRO, Field } from '@/components/ui'
import { ROLES, useApp, useRole } from '@/store'
import { HARI, HARI_S, TODAY, archived, fmtTgl, guruOfferings, kalender, kuis, offeringTitle, offerings, pengumuman, scheduleOf, siswaOfferings, subjectById, teacherById, tugas, weekDays, kelasById, fmtBatas, addDays, type Offering, type Slot } from '@/data'
import { PasswordForm } from './auth'

// ---------- Jadwal Minggu Ini (strip) ----------
export function ScheduleCard({ offs, mode }: { offs: Offering[]; mode: 'siswa' | 'guru' }) {
  const days = weekDays(); const [sel, setSel] = useState(TODAY.getDay()); const nav = useNavigate(); const { cfg } = useRole()
  const list = scheduleOf(offs, sel); const selDate = days.find((d) => d.getDay() === sel)!
  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-4"><h3 className="text-lg font-bold whitespace-nowrap">Jadwal Minggu Ini</h3><span className="text-xs text-muted text-right leading-tight pt-1.5 whitespace-nowrap">Hari ini: <b className="text-ink">29 Oktober 2026</b></span></div>
      <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Pilih hari">
        {days.map((d) => { const on = d.getDay() === sel; const today = d.toDateString() === TODAY.toDateString(); const has = scheduleOf(offs, d.getDay()).length > 0
          return <button key={d.getTime()} role="tab" aria-selected={on} onClick={() => setSel(d.getDay())} className={cn('flex flex-col items-center py-2 rounded-2xl gap-1 transition-colors', on && !today && 'bg-gray-100')}>
            <span className={cn('text-xs font-bold', today ? 'text-primary-dark' : 'text-muted')}>{HARI_S[d.getDay()]}</span>
            <span className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold', today ? 'bg-primary text-white' : 'text-ink', on && !today && 'ring-2 ring-primary/40')}>{d.getDate()}</span>
            <span className={cn('w-1.5 h-1.5 rounded-full', has ? 'bg-primary' : 'bg-transparent')} /></button> })}
      </div>
      <div className="mt-4 text-sm font-bold text-muted mb-2">{fmtTgl(selDate)}</div>
      {list.length === 0 ? <Empty title="Tidak ada jadwal" text="Tidak ada kelas pada hari ini. Selamat beristirahat!" /> : (
        <ul className="space-y-3">{list.map(({ o, s }, i) => (
          <li key={i} className="border border-line rounded-2xl p-4 hover:bg-gray-50 transition">
            <Link to={`${cfg.base}/kelas/${o.id}`} className="font-extrabold text-sm uppercase leading-snug hover:text-primary-dark block">{offeringTitle(o)}</Link>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13px] text-muted">
              <span className="flex items-center gap-1.5"><BookOpen size={15} />Sesi {s.sesi}</span><span className="flex items-center gap-1.5"><Clock size={15} />{s.mulai} - {s.selesai}</span><span className="flex items-center gap-1.5"><MapPin size={15} />{s.mode} - {s.ruang}</span></div>
            {mode === 'guru' && <Btn className="mt-3 !h-9" icon={<CheckCheck size={16} />} onClick={() => nav(`/guru/presensi/${o.id}/sesi/${s.sesi}`)}>Mulai Presensi</Btn>}
          </li>))}</ul>)}
      <Link to={`${cfg.base}/jadwal`} className="block text-center text-sm font-bold text-accent mt-4 hover:underline">Lihat jadwal lengkap</Link>
    </Card>
  )
}

// ---------- Tabs Kelas Aktif/Arsip + grid ----------
export function ClassBrowser({ mode, withFilter, to }: { mode: 'siswa' | 'guru'; withFilter?: boolean; to: string }) {
  const [tab, setTab] = useTab('aktif', 'kelas'); const [q, setQ] = useState(''); const [sem, setSem] = useState('Semua'); const [kl, setKl] = useState('Semua')
  const active = mode === 'siswa' ? siswaOfferings('k2') : guruOfferings('t1')
  const arch = mode === 'siswa' ? archived : archived.filter((a) => a.guru === 't1')
  const base = tab === 'aktif' ? active : arch
  const list = useMemo(() => base.filter((o) => { const t = `${subjectById(o.subjectId).nama} ${o.kode} ${teacherById(o.guru).sapaan} ${o.co.map((c) => teacherById(c).sapaan).join(' ')}`.toLowerCase(); return t.includes(q.toLowerCase()) && (sem === 'Semua' || o.semester === sem) && (kl === 'Semua' || kelasById(o.kelasId).nama === kl) }), [base, q, sem, kl])
  const title = tab === 'aktif' ? 'Kelas Aktif' : 'Kelas Arsip'
  return (
    <div>
      <Tabs tabs={[{ v: 'aktif', l: 'Kelas Aktif' }, { v: 'arsip', l: 'Kelas Arsip' }]} value={tab} onChange={setTab} />
      <h2 className="text-[22px] font-bold mt-6">{title}</h2>
      <p className="text-muted text-sm mt-1 mb-4">{tab === 'aktif' ? (mode === 'siswa' ? `Kamu memiliki ${active.length} kelas sesuai jadwal pelajaran pada semester ini` : `Kamu mengampu ${active.length} kelas pada semester ini`) : `Terdapat ${arch.length} kelas dari semester sebelumnya`}</p>
      <div className="flex flex-wrap gap-3 mb-5"><SearchBar large className="flex-1 min-w-[260px]" value={q} onChange={setQ} placeholder="Cari berdasarkan mata pelajaran, kode kelas, atau nama guru" />
        {withFilter && <><Select aria-label="Filter semester" value={sem} onChange={(e) => setSem(e.target.value)} options={['Semua', 'Semester Ganjil 2026/2027', 'Semester Genap 2025/2026']} className="!h-12 w-56" />{mode === 'guru' && <Select aria-label="Filter kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...[...new Set(active.map((o) => kelasById(o.kelasId).nama))]]} className="!h-12 w-40" />}</>}</div>
      {list.length === 0 ? <Card><Empty title="Kelas tidak ditemukan" text="Tidak ada kelas yang cocok dengan pencarianmu." action={<Btn variant="outline" onClick={() => { setQ(''); setSem('Semua'); setKl('Semua') }}>Reset Pencarian</Btn>} /></Card>
        : <div className="grid md:grid-cols-2 gap-5">{list.map((o) => <ClassCard key={o.id} o={o} mode={mode} to={`${to}/${o.id}`} />)}</div>}
    </div>
  )
}

// ---------- Jadwal (grid mingguan) ----------
const hr = (t: string) => { const [h, m] = t.split('.').map(Number); return h + m / 60 }
export function WeeklyGrid({ blocks }: { blocks: { o: Offering; s: Slot }[] }) {
  const hours = Array.from({ length: 9 }, (_, i) => 7 + i); const H = 60; const { cfg } = useRole(); const nav = useNavigate()
  return (
    <div className="overflow-x-auto"><div className="min-w-[860px]">
      <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}><div />{[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className={cn('text-center py-2 font-bold text-sm', d === TODAY.getDay() && 'text-primary-dark')}>{HARI[d]}</div>)}</div>
      <div className="grid relative" style={{ gridTemplateColumns: '56px repeat(6, 1fr)', height: hours.length * H }}>
        <div>{hours.map((h) => <div key={h} className="text-xs text-muted pr-2 text-right" style={{ height: H }}>{String(h).padStart(2, '0')}.00</div>)}</div>
        {[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className={cn('relative border-l border-line', d === TODAY.getDay() && 'bg-primary-light/40')}>
          {hours.map((h) => <div key={h} className="border-t border-line/70" style={{ height: H }} />)}
          {blocks.filter((b) => b.s.hari === d).map(({ o, s }, i) => { const sub = subjectById(o.subjectId)
            return <button key={i} onClick={() => nav(`${cfg.base}/kelas/${o.id}`)} className="absolute left-1 right-1 rounded-xl p-2 text-left text-white overflow-hidden hover:brightness-95 shadow-soft" style={{ top: (hr(s.mulai) - 7) * H + 1, height: (hr(s.selesai) - hr(s.mulai)) * H - 3, background: sub.warna }}>
              <div className="text-xs font-extrabold leading-tight">{sub.nama}</div><div className="text-[11px] opacity-90">{o.kode} • {s.ruang}</div><div className="text-[11px] opacity-90">{s.mulai}-{s.selesai}</div></button> })}</div>)}
      </div></div></div>
  )
}
export function JadwalPage() {
  const { role } = useRole(); const guru = role === 'guru'; const offs = guru ? guruOfferings('t1') : siswaOfferings('k2')
  const [tab, setTab] = useTab('jadwal'); const [view, setView] = useState<'grid' | 'list'>('grid')
  const blocks = offs.flatMap((o) => o.jadwal.map((s) => ({ o, s })))
  const title = guru ? 'Jadwal Mengajar' : 'Jadwal Pelajaran'
  const jenisTone = (j: string) => j === 'Libur' ? 'red' : j === 'Kegiatan' ? 'blue' : 'amber'
  return (
    <div>
      <PageHeader crumbs={useCrumbs({ l: title })} title={title} subtitle={guru ? 'Jadwal mengajar mingguan Anda semester ganjil 2026/2027' : 'Jadwal pelajaran kelas XI RPL 1 semester ganjil 2026/2027'} actions={tab === 'jadwal' && <Segmented value={view} onChange={setView} options={[{ v: 'grid', l: <><LayoutGrid size={15} />Grid</> }, { v: 'list', l: <><List size={15} />Daftar</> }]} />} />
      <Tabs className="mb-6" tabs={[{ v: 'jadwal', l: 'Jadwal Mingguan' }, { v: 'kalender', l: 'Kalender Akademik' }]} value={tab} onChange={setTab} />
      {tab === 'jadwal' ? (view === 'grid' ? <Card><WeeklyGrid blocks={blocks} /></Card> : (
        <div className="grid md:grid-cols-2 gap-5">{[1, 2, 3, 4, 5, 6].map((d) => <Card key={d}><CardTitle right={d === TODAY.getDay() && <Badge tone="green">Hari ini</Badge>}>{HARI[d]}</CardTitle>
          {scheduleOf(offs, d).length === 0 ? <p className="text-sm text-muted">Tidak ada jadwal.</p> : <ul className="space-y-2.5">{scheduleOf(offs, d).map(({ o, s }, i) => <li key={i} className="flex gap-3 items-center"><span className="w-1.5 h-12 rounded-full" style={{ background: subjectById(o.subjectId).warna }} /><div><div className="font-bold text-sm uppercase">{offeringTitle(o)}</div><div className="text-xs text-muted">{s.mulai} - {s.selesai} • {s.mode} - {s.ruang}</div></div></li>)}</ul>}</Card>)}</div>
      )) : (
        <Card><div className="flex gap-3 flex-wrap mb-4">{['UTS', 'UAS', 'Libur', 'Kegiatan'].map((j) => <Badge key={j} tone={jenisTone(j)}>{j}</Badge>)}</div>
          <ul className="divide-y divide-line">{kalender.map((k) => <li key={k.judul} className="py-3.5 flex items-center gap-4"><div className="w-14 text-center bg-primary-light rounded-xl py-1.5"><div className="text-xs font-bold text-primary-dark">{new Date(k.tgl).toLocaleDateString('id-ID', { month: 'short' })}</div><div className="text-xl font-extrabold">{new Date(k.tgl).getDate()}</div></div><div className="flex-1"><div className="font-bold">{k.judul}</div><div className="text-sm text-muted">{k.akhir !== k.tgl ? `${new Date(k.tgl).getDate()} - ${new Date(k.akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : new Date(k.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><Badge tone={jenisTone(k.jenis)}>{k.jenis}</Badge></li>)}</ul></Card>)}
    </div>
  )
}

// ---------- Pengumuman ----------
export function PengumumanList() {
  const { role, cfg } = useRole(); const { toast } = useApp(); const [q, setQ] = useState(''); const [cat, setCat] = useState('Semua'); const [add, setAdd] = useState(false); const [items, setItems] = useState(pengumuman)
  const [f, setF] = useState({ judul: '', isi: '' }); const [e, setE] = useState<Record<string, string>>({})
  const list = items.filter((p) => (cat === 'Semua' || p.kategori === cat) && (p.judul + p.isi).toLowerCase().includes(q.toLowerCase()))
  const save = () => { const x: Record<string, string> = {}; if (!f.judul.trim()) x.judul = 'Judul wajib diisi'; if (f.isi.trim().length < 10) x.isi = 'Isi pengumuman minimal 10 karakter'; setE(x); if (Object.keys(x).length) return; setItems([{ id: 'pn' + Date.now(), judul: f.judul, isi: f.isi, oleh: cfg.nama, tgl: '29 Okt 2026', kategori: 'Akademik', penting: false }, ...items]); setAdd(false); setF({ judul: '', isi: '' }); toast('Pengumuman berhasil dipublikasikan') }
  return (
    <div>
      <PageHeader crumbs={useCrumbs({ l: 'Pengumuman' })} title="Pengumuman" subtitle="Informasi resmi sekolah dan kelas. Pengumuman bersifat satu arah." actions={(role === 'guru') && <Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Buat Pengumuman</Btn>} />
      <div className="flex flex-wrap gap-3 mb-5 items-center"><SearchBar value={q} onChange={setQ} placeholder="Cari pengumuman" className="w-80 max-w-full" /><Chips value={cat} onChange={setCat} options={['Semua', 'Akademik', 'Kegiatan', 'Sistem', 'Lomba', 'Tata Tertib'].map((k) => ({ k, l: k }))} /></div>
      {list.length === 0 ? <Card><Empty title="Pengumuman tidak ditemukan" /></Card> : <div className="grid md:grid-cols-2 gap-5">{list.map((p) => (
        <Link key={p.id} to={`${cfg.base}/pengumuman/${p.id}`}><Card hover className="h-full"><div className="flex items-center gap-2 mb-2"><Badge tone="blue">{p.kategori}</Badge>{p.penting && <Badge tone="red">Penting</Badge>}<span className="ml-auto text-xs text-muted">{p.tgl}</span></div><h3 className="font-bold text-lg leading-snug">{p.judul}</h3><p className="text-sm text-muted mt-2 line-clamp-2">{p.isi}</p><div className="flex items-center gap-2 mt-4 text-sm"><Avatar name={p.oleh} size={28} /><span className="text-muted">{p.oleh}</span></div></Card></Link>))}</div>}
      <Modal open={add} onClose={() => setAdd(false)} title="Buat Pengumuman" footer={<><Btn variant="outline" onClick={() => setAdd(false)}>Batal</Btn><Btn onClick={save}>Publikasikan</Btn></>}><Input label="Judul" value={f.judul} onChange={(x) => setF({ ...f, judul: x.target.value })} error={e.judul} /><Textarea label="Isi Pengumuman" value={f.isi} onChange={(x) => setF({ ...f, isi: x.target.value })} error={e.isi} /></Modal>
    </div>
  )
}
export function PengumumanDetail() {
  const { id } = useParams(); const { cfg } = useRole(); const p = pengumuman.find((x) => x.id === id)
  if (!p) return <Card><Empty title="Pengumuman tidak ditemukan" action={<Btn to={`${cfg.base}/pengumuman`}>Kembali</Btn>} /></Card>
  return <div><PageHeader crumbs={useCrumbs({ l: 'Pengumuman', to: `${cfg.base}/pengumuman` }, { l: 'Detail' })} title={p.judul} subtitle={`${p.oleh} • ${p.tgl}`} actions={<Btn variant="outline" to={`${cfg.base}/pengumuman`}>Kembali</Btn>} />
    <div className="grid lg:grid-cols-[1fr_340px] gap-6"><Card><div className="flex gap-2 mb-4"><Badge tone="blue">{p.kategori}</Badge>{p.penting && <Badge tone="red">Penting</Badge>}</div><p className="leading-7 text-[15px]">{p.isi}</p><p className="leading-7 mt-4 text-muted">Pengumuman ini bersifat satu arah. Jika ada pertanyaan, silakan hubungi wali kelas atau guru mata pelajaran terkait.</p></Card>
      <Card><CardTitle>Pengumuman Lainnya</CardTitle><ul className="space-y-3">{pengumuman.filter((x) => x.id !== p.id).slice(0, 4).map((x) => <li key={x.id}><Link className="block hover:text-primary-dark" to={`${cfg.base}/pengumuman/${x.id}`}><div className="font-bold text-sm">{x.judul}</div><div className="text-xs text-muted">{x.tgl}</div></Link></li>)}</ul></Card></div></div>
}

// ---------- Notifikasi ----------
export function NotifikasiPage() {
  const { notifs, markRead, markAll, toast } = useApp(); const [f, setF] = useState('Semua')
  const jenis = ['Semua', 'Belum Dibaca', ...new Set(notifs.map((n) => n.jenis))]
  const list = notifs.filter((n) => f === 'Semua' || (f === 'Belum Dibaca' ? !n.read : n.jenis === f))
  const icon = (k: string) => k === 'tugas' ? <ClipboardList size={18} /> : k === 'kuis' ? <BookMarked size={18} /> : k === 'nilai' ? <Award size={18} /> : k === 'materi' ? <FileText size={18} /> : k === 'hadir' ? <CheckCircle2 size={18} /> : <Info size={18} />
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Notifikasi' })} title="Notifikasi" subtitle={`${notifs.filter((n) => !n.read).length} notifikasi belum dibaca`} actions={<Btn variant="outline" icon={<CheckCheck size={18} />} onClick={() => { markAll(); toast('Semua notifikasi ditandai sudah dibaca') }}>Tandai Semua Dibaca</Btn>} />
      <div className="mb-5"><Chips value={f} onChange={setF} options={jenis.map((k) => ({ k, l: k }))} /></div>
      {list.length === 0 ? <Card><Empty title="Tidak ada notifikasi" text="Notifikasi baru akan muncul di sini." /></Card> : ['Hari Ini', 'Kemarin'].map((g) => { const items = list.filter((n) => n.grup === g); if (!items.length) return null
        return <div key={g} className="mb-6"><h3 className="font-bold text-muted text-sm uppercase tracking-wide mb-3">{g}</h3><Card pad={false} className="divide-y divide-line overflow-hidden">{items.map((n) => <button key={n.id} onClick={() => markRead(n.id)} className={cn('w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50', !n.read && 'bg-primary-light/50')}><span className="w-10 h-10 rounded-full bg-primary-light text-primary-dark flex items-center justify-center shrink-0">{icon(n.ikon)}</span><span className="flex-1"><span className={cn('block', !n.read && 'font-bold')}>{n.judul}</span><span className="text-xs text-muted">{n.jenis} • {n.waktu}</span></span>{!n.read ? <Badge tone="blue">Baru</Badge> : <CheckCheck size={16} className="text-muted" />}</button>)}</Card></div> })}</div>
  )
}

// ---------- Akun ----------
export function AkunPage() {
  const { cfg, role } = useRole(); const { toast } = useApp(); const [tab, setTab] = useTab('profil'); const ro = isRO(role)
  const [f, setF] = useState({ nama: cfg.nama, email: `${cfg.nama.split(',')[0].toLowerCase().replace(/[^a-z ]/g, '').split(' ').join('.')}@smkn2indramayu.sch.id`, hp: '0812-3456-7890', alamat: 'Jl. Jenderal Sudirman No. 12, Indramayu' }); const [e, setE] = useState<Record<string, string>>({})
  const save = () => { const x: Record<string, string> = {}; if (f.nama.trim().length < 3) x.nama = 'Nama minimal 3 karakter'; if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Format email tidak valid'; if (!/^[0-9-]{9,}$/.test(f.hp)) x.hp = 'Nomor telepon tidak valid'; setE(x); if (!Object.keys(x).length) toast('Data diri berhasil disimpan') }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelola Akun' })} title="Kelola Akun" subtitle="Atur foto, data diri, dan keamanan akunmu" />
      <Tabs className="mb-6" tabs={[{ v: 'profil', l: 'Data Diri' }, { v: 'foto', l: 'Foto Profil' }, { v: 'sandi', l: 'Ganti Kata Sandi' }]} value={tab} onChange={setTab} />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6"><Card className="text-center h-fit"><div className="relative inline-block"><Avatar name={cfg.nama} size={104} /><span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-white"><Camera size={16} /></span></div><h3 className="font-bold text-lg mt-3">{cfg.nama}</h3><p className="text-muted text-sm">{cfg.sub}</p><Badge tone="green" className="mt-3">{cfg.chip}</Badge></Card>
        <Card>{tab === 'profil' && <div className="space-y-4 max-w-xl"><Input label="Nama Lengkap" value={f.nama} disabled={ro} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><Input label="Email" value={f.email} disabled={ro} onChange={(x) => setF({ ...f, email: x.target.value })} error={e.email} /><Input label="Nomor Telepon" value={f.hp} disabled={ro} onChange={(x) => setF({ ...f, hp: x.target.value })} error={e.hp} /><Textarea label="Alamat" value={f.alamat} disabled={ro} onChange={(x) => setF({ ...f, alamat: x.target.value })} />{ro ? <p className="text-sm text-muted flex items-center gap-2"><Info size={16} />Data diri dikelola oleh Tata Usaha.</p> : <Btn icon={<Save size={18} />} onClick={save}>Simpan Perubahan</Btn>}</div>}
          {tab === 'foto' && <div className="max-w-xl"><CardTitle>Foto Profil</CardTitle><p className="text-sm text-muted mb-4">Gunakan foto formal berukuran maksimal 2 MB (JPG atau PNG).</p><div className="flex gap-3"><Btn icon={<Camera size={18} />} onClick={() => toast('Foto profil berhasil diperbarui')}>Unggah Foto Baru</Btn><Btn variant="outline" onClick={() => toast('Foto profil dihapus', 'info')}>Hapus Foto</Btn></div></div>}
          {tab === 'sandi' && <div className="max-w-md"><CardTitle>Ganti Kata Sandi</CardTitle><PasswordForm onDone={() => toast('Kata sandi berhasil diubah')} /></div>}</Card></div></div>
  )
}
// ---------- Pengaturan ----------
export function PengaturanPage() {
  const { toast } = useApp(); const [n, setN] = useState({ tugas: true, kuis: true, nilai: true, pengumuman: true, presensi: false }); const [tema, setTema] = useState('Terang'); const [ukuran, setUkuran] = useState('Sedang'); const [bhs] = useState('Bahasa Indonesia')
  const rows: [keyof typeof n, string, string][] = [['tugas', 'Tugas baru dan pengingat batas waktu', 'Dapatkan notifikasi saat tugas baru dibuat atau mendekati batas'], ['kuis', 'Kuis dan jadwal ujian', 'Pemberitahuan saat kuis dibuka atau akan ditutup'], ['nilai', 'Nilai dan umpan balik', 'Pemberitahuan ketika nilai dipublikasikan'], ['pengumuman', 'Pengumuman', 'Informasi resmi dari sekolah dan guru'], ['presensi', 'Presensi', 'Ringkasan kehadiran setiap sesi']]
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Pengaturan' })} title="Pengaturan" subtitle="Atur notifikasi dalam aplikasi dan tampilan" actions={<Btn icon={<Save size={18} />} onClick={() => toast('Pengaturan berhasil disimpan')}>Simpan Pengaturan</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6"><Card><CardTitle icon={<Bell size={20} className="text-primary" />}>Notifikasi dalam Aplikasi</CardTitle><ul className="divide-y divide-line">{rows.map(([k, t, d]) => <li key={k} className="flex items-center gap-4 py-3.5"><div className="flex-1"><div className="font-bold text-sm">{t}</div><div className="text-xs text-muted">{d}</div></div><Toggle on={n[k]} onChange={(v) => setN({ ...n, [k]: v })} label={t} /></li>)}</ul></Card>
        <Card><CardTitle icon={<Palette size={20} className="text-primary" />}>Tampilan</CardTitle><div className="space-y-5"><div><div className="font-bold text-sm mb-2">Tema</div><Segmented value={tema} onChange={setTema} options={['Terang', 'Gelap', 'Otomatis']} />{tema !== 'Terang' && <p className="text-xs text-muted mt-2">Tema gelap akan tersedia pada pembaruan berikutnya.</p>}</div><div><div className="font-bold text-sm mb-2 flex items-center gap-2"><Type size={16} />Ukuran Teks</div><Segmented value={ukuran} onChange={setUkuran} options={['Kecil', 'Sedang', 'Besar']} /></div><Select label="Bahasa" value={bhs} options={['Bahasa Indonesia']} onChange={() => {}} /></div></Card></div></div>
  )
}
// ---------- Panduan ----------
export function PanduanPage() {
  const { role } = useRole()
  const common = [['Bagaimana cara masuk ke sistem?', 'Gunakan NIS (siswa) atau NIP (guru dan staf) beserta kata sandi yang diberikan sekolah. Jika lupa, pilih "Lupa kata sandi" pada halaman masuk.'], ['Bagaimana mengganti kata sandi?', 'Buka menu akun di kanan atas, pilih Kelola Akun, lalu tab Ganti Kata Sandi. Gunakan kombinasi huruf besar, kecil, dan angka.'], ['Bagaimana membaca notifikasi?', 'Klik ikon lonceng di bagian atas untuk melihat 5 notifikasi terbaru, atau pilih "Lihat semua" untuk daftar lengkap dan filter.'], ['Materi apa saja yang didukung?', 'Materi berupa dokumen (PDF, DOCX), gambar (PNG, JPG), dan tautan video YouTube.']]
  const spes: Record<string, string[][]> = {
    siswa: [['Bagaimana mengumpulkan tugas?', 'Buka Tugas & Kuis, pilih tugas, unggah berkas pada kartu status, lalu tekan Kumpulkan. Kamu dapat membatalkan pengumpulan selama belum melewati batas waktu.'], ['Bagaimana mengerjakan kuis?', 'Pilih kuis, baca instruksi, lalu tekan Mulai Kuis. Waktu berjalan otomatis dan jawaban terkumpul saat waktu habis.'], ['Bagaimana melihat kehadiranku?', 'Buka Nilai & Kehadiran. Presensi dicatat oleh guru dan bersifat hanya-lihat bagi siswa.']],
    guru: [['Bagaimana memulai presensi?', 'Dari Beranda atau menu Presensi pilih kelas dan pertemuan, lalu tekan Mulai Presensi. Isi status siswa secara manual dan simpan.'], ['Bagaimana menilai tugas?', 'Buka Penilaian, pilih pengumpulan siswa, isi nilai dan umpan balik pada panel samping, lalu Simpan dan Berikutnya.'], ['Bagaimana menyusun kuis?', 'Pada tab Kuis kelas pilih Buat Kuis, lengkapi pengaturan, tambah soal atau impor dari Bank Soal, lalu publikasikan.']],
    wali: [['Apa yang dapat dilihat wali kelas?', 'Wali kelas dapat memantau nilai, kehadiran, dan tugas siswa perwalian secara hanya-lihat.']],
    kepsek: [['Bagaimana membaca statistik?', 'Gunakan filter kelas, mata pelajaran, dan periode pada Beranda atau Statistik untuk membandingkan capaian.']],
    tu: [['Bagaimana menambah data siswa?', 'Buka Master Data > Siswa, tekan Tambah Siswa atau Import Excel dengan template yang tersedia.']],
  }
  const items = [...(spes[role] ?? []), ...common].map((x, i) => ({ id: 'f' + i, title: x[0], body: <p className="text-sm text-muted leading-6">{x[1]}</p> }))
  return <div><PageHeader crumbs={useCrumbs({ l: 'User Guide' })} title="User Guide" subtitle="Pertanyaan yang sering diajukan seputar penggunaan sistem" /><div className="max-w-3xl"><Accordion items={items} /></div></div>
}
export { Calendar, Megaphone, Pencil, Trash2, Users, fmtBatas, addDays, kuis, tugas, offerings, Field, Camera }
