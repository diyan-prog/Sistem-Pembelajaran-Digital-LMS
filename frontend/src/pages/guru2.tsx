import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Check, CheckCheck, Download, Eye, Expand, FileSpreadsheet, FileText, Library, Maximize2, Pencil, Plus, Printer, QrCode, RefreshCw, Save, Search, Trash2, Upload, X, Info, Calendar, Clock, MapPin, ClipboardCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, Btn, Card, CardTitle, Chips, DataTable, Dropzone, Drawer, Empty, FileIcon, Field, Input, Modal, NameCell, PageHeader, Progress, Ring, SearchBar, Segmented, Select, Stat, StatusBadge, Textarea, cn, fileTone, useCrumbs, download } from '@/components/ui'
import { useApp } from '@/context'
import { YtThumb } from './siswa'
import { KATEGORI_KOMENTAR, TODAY, addDays, bankSoal, fmtBatas, fmtTgl, fmtTglPendek, guruOfferings, kelasById, kuis, kuisById, kuisSoal, mediaFiles, nilaiKelas, offeringById, offeringTitle, seedStat, studentsOf, subSiswa, subjectById, tugas, tugasById, sesiOf, type Soal, type TStatus } from '@/data'
import { fetchPengampu, fromPengampuToOffering, type Pengampu } from '@/services/akademik'
import { fetchTugas, fetchKuis, type Tugas, type Kuis } from '@/services/materi'
import { fetchPresensi, createPresensi } from '@/services/presensi'
import { useGuruData } from '@/hooks/useGuruData'

// Helper for presensi data fetching
const usePresensiData = (offId?: string) => {
  const [presensi, setPresensi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!offId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPresensi(offId);
        setPresensi(data);
      } catch (e) {
        console.error('Failed to fetch presensi:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [offId]);
  
  return { presensi, loading };
};

export function PresensiPick() {
  const { pengampu, loading } = useGuruData();
  const offs = useMemo(() => pengampu.length > 0 ? pengampu.map(fromPengampuToOffering) : guruOfferings('t1'), [pengampu]);
  
  if (loading) return <div className="p-8 text-center text-muted">Memuat data kelas...</div>;
  
  return <div><PageHeader crumbs={useCrumbs({ l: 'Presensi' })} title="Presensi" subtitle="Pilih kelas untuk melihat daftar pertemuan dan mengelola presensi" />
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{offs.map((o) => <Link key={o.id} to={`/guru/presensi/${o.id}`}><Card hover className="h-full"><div className="flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center"><ClipboardCheck /></span><div><b className="block uppercase leading-snug">{offeringTitle(o)}</b><span className="text-xs text-muted">{kelasById(o.kelasId).nama} • 25 siswa</span></div></div><div className="mt-4 text-sm flex justify-between"><span className="text-muted">Pertemuan terlaksana</span><b>{o.done} / {o.total}</b></div><Progress value={(o.done / o.total) * 100} tone="green" className="mt-2" /></Card></Link>)}</div></div>
}
export function PresensiList() {
  const { offId } = useParams(); const o = offeringById(offId!); const nav = useNavigate(); const { toast } = useApp(); const base = sesiOf(o.id)
  const mk = (n: number, extra = 0) => { const tgl = base[n - 1]?.tanggal ?? addDays(TODAY, (n - o.done - 1) * 7); const seed = (n * 7) % 5; const h = 25 - seed - (n % 3 === 0 ? 1 : 0); const i = n % 4 === 0 ? 1 : 0; const sk = n % 5 === 0 ? 1 : 0; const al = 25 - h - i - sk; return { id: n, n, tgl, tanggal: fmtTgl(tgl), jam: `${o.jadwal[0].mulai} - ${o.jadwal[0].selesai}`, materi: base[n - 1]?.materi ?? ['Pengantar Bab Baru', 'Praktik Terbimbing', 'Studi Kasus', 'Evaluasi Bab'][(n + extra) % 4], h, i, s: sk, a: al, status: n <= o.done ? 'Selesai' : n === o.done + 1 ? 'Berlangsung' : 'Terjadwal' } }
  const [extra, setExtra] = useState(0); const rows = useMemo(() => Array.from({ length: o.done + 4 + extra }, (_, k) => mk(k + 1)).reverse(), [o.id, extra])
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Presensi', to: '/guru/presensi' }, { l: kelasById(o.kelasId).nama })} title={`Daftar Pertemuan: ${subjectById(o.subjectId).nama}`} subtitle={`${offeringTitle(o)} • ${o.done} dari ${o.total} sesi`} actions={<><Btn variant="outline" to={`/guru/presensi/${o.id}/rekap`} icon={<FileSpreadsheet size={18} />}>Rekap Presensi</Btn><Btn variant="outline" icon={<Plus size={18} />} onClick={() => { setExtra(extra + 1); toast('Pertemuan baru berhasil dibuat') }}>Buat Pertemuan</Btn><Btn icon={<QrCode size={18} />} to={`/guru/presensi/${o.id}/sesi/${o.done + 1}`}>Mulai Presensi</Btn></>} />
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.materi} searchPlaceholder="Cari materi" cols={[{ key: 'n', header: 'Pertemuan', sort: (r) => r.n, render: (r) => <b>Ke-{r.n}</b> }, { key: 'tanggal', header: 'Tanggal', sort: (r) => r.tgl.getTime() }, { key: 'jam', header: 'Jam' }, { key: 'materi', header: 'Materi' }, { key: 'h', header: 'Hadir', render: (r) => r.status === 'Terjadwal' ? '-' : <Badge tone="green">{r.h}</Badge> }, { key: 'i', header: 'Izin', render: (r) => r.status === 'Terjadwal' ? '-' : <Badge tone="blue">{r.i}</Badge> }, { key: 's', header: 'Sakit', render: (r) => r.status === 'Terjadwal' ? '-' : <Badge tone="amber">{r.s}</Badge> }, { key: 'a', header: 'Alpa', render: (r) => r.status === 'Terjadwal' ? '-' : <Badge tone="red">{r.a}</Badge> }, { key: 'status', header: 'Status', render: (r) => <StatusBadge s={r.status === 'Selesai' ? 'Selesai' : r.status === 'Berlangsung' ? 'Berlangsung' : 'Terjadwal'} /> }]}
        actions={(r) => [{ l: r.status === 'Selesai' ? 'Lihat / Ubah Presensi' : 'Mulai Presensi', icon: <QrCode size={16} />, onClick: () => nav(`/guru/presensi/${o.id}/sesi/${r.n}`) }]} /></div>
  )
}

const code = () => `PWB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
export function PresensiSesi() {
  const { offId, n } = useParams(); const o = offeringById(offId!); const { toast, confirm } = useApp(); const nav = useNavigate(); const ss = studentsOf(o.kelasId); const slot = o.jadwal[0]
  const [st, setSt] = useState<Record<string, string>>({}); const [ket, setKet] = useState<Record<string, string>>({}); const [q, setQ] = useState(''); const [c, setC] = useState(code()); const [left, setLeft] = useState(60); const [full, setFull] = useState(false); const [busy, setBusy] = useState(false)
  useEffect(() => { const t = setInterval(() => setLeft((l) => (l <= 1 ? (setC(code()), 60) : l - 1)), 1000); return () => clearInterval(t) }, [])
  const cnt = (k: string) => ss.filter((s) => st[s.id] === k).length; const belum = ss.filter((s) => !st[s.id]).length
  const refresh = () => { setC(code()); setLeft(60); toast('Barcode diperbarui', 'info') }
  const save = () => confirm({ title: 'Simpan Presensi?', message: belum ? `${belum} siswa belum diberi status dan akan dicatat sebagai Alpa.` : 'Presensi pertemuan ini akan disimpan.', okLabel: 'Simpan Presensi', onOk: () => { setBusy(true); setTimeout(() => { setBusy(false); toast('Presensi berhasil disimpan'); nav(`/guru/presensi/${o.id}`) }, 700) } })
  const qr = `SPD|${o.id}|${n}|${c}`; const mm = `00:${String(left).padStart(2, '0')}`
  const opts = [['Hadir', 'bg-primary text-white'], ['Izin', 'bg-accent text-white'], ['Sakit', 'bg-warn text-white'], ['Alpa', 'bg-danger text-white']]
  const rows = ss.filter((s) => s.nama.toLowerCase().includes(q.toLowerCase()))
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Presensi', to: '/guru/presensi' }, { l: kelasById(o.kelasId).nama, to: `/guru/presensi/${o.id}` }, { l: `Pertemuan ${n}` })} title={`Sesi Presensi: Pertemuan ${n}`} actions={<Btn variant="outline" icon={<ArrowLeft size={18} />} to={`/guru/presensi/${o.id}`}>Kembali</Btn>} />
      <Card className="mb-6 !py-4"><div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">{[[<Calendar size={16} />, fmtTgl(TODAY)], [<Clock size={16} />, `Jam ke-${5}-${6} • ${slot.mulai} - ${slot.selesai}`], [<FileText size={16} />, subjectById(o.subjectId).nama], [<ClipboardCheck size={16} />, kelasById(o.kelasId).nama], [<MapPin size={16} />, `Ruang ${slot.ruang}`]].map(([i, t], k) => <span key={k} className="flex items-center gap-2 font-semibold"><span className="text-muted">{i}</span>{t}</span>)}</div></Card>
      <div className="grid lg:grid-cols-[35%_1fr] gap-6 items-start">
        <Card className="text-center lg:sticky lg:top-24"><CardTitle>Barcode Presensi</CardTitle><div className="inline-block p-4 bg-white border-2 border-primary/30 rounded-3xl"><QRCodeSVG value={qr} size={220} level="M" fgColor="#1F2937" /></div>
          <div className="mt-4 text-xs text-muted">Kode Sesi</div><div className="text-2xl font-extrabold tracking-[0.2em]">{c}</div>
          <div className="flex justify-center mt-4"><Ring value={(left / 60) * 100} size={96} stroke={9} label={mm} sub="berlaku" color={left < 10 ? '#DC2626' : '#0B3D5F'} /></div>
          <div className="grid grid-cols-3 gap-2 mt-5"><Btn variant="outline" className="!px-2" icon={<RefreshCw size={16} />} onClick={refresh}>Perbarui</Btn><Btn variant="outline" className="!px-2" icon={<Maximize2 size={16} />} onClick={() => setFull(true)}>Layar Penuh</Btn><Btn variant="outline" className="!px-2" icon={<Printer size={16} />} onClick={() => window.print()}>Cetak</Btn></div>
          <p className="text-xs text-muted mt-4 flex items-start gap-2 text-left bg-gray-50 rounded-xl p-3"><Info size={14} className="shrink-0 mt-0.5" />Pemindaian oleh siswa belum tersedia pada versi web ini. Presensi dicatat manual oleh guru.</p></Card>
        <div className="space-y-4 min-w-0"><div className="flex flex-wrap gap-2">{[['Hadir', cnt('Hadir'), 'green'], ['Izin', cnt('Izin'), 'blue'], ['Sakit', cnt('Sakit'), 'amber'], ['Alpa', cnt('Alpa'), 'red'], ['Belum diisi', belum, 'gray']].map(([l, v, t]) => <Badge key={l as string} tone={t as string} className="!text-sm !px-3 !py-1">{l}: {v}</Badge>)}</div>
          <Card pad={false} className="overflow-hidden"><div className="p-4 flex flex-wrap gap-3 border-b border-line"><SearchBar value={q} onChange={setQ} placeholder="Cari nama siswa" className="w-full sm:w-72" /><Btn variant="outline" icon={<CheckCheck size={18} />} onClick={() => { setSt(Object.fromEntries(ss.map((s) => [s.id, 'Hadir']))); toast('Semua siswa ditandai hadir', 'info') }}>Hadirkan Semua</Btn><Btn className="ml-auto" loading={busy} icon={<Save size={18} />} onClick={save}>Simpan Presensi</Btn></div>
            <div className="overflow-auto max-h-[620px]"><table className="w-full text-sm min-w-[640px]"><thead className="sticky top-0 bg-gray-50 z-10 text-xs uppercase text-muted text-left"><tr><th className="px-4 h-12">Siswa</th><th>Status</th><th className="pr-4">Keterangan</th></tr></thead><tbody>{rows.map((s) => <tr key={s.id} className="h-14 border-t border-line hover:bg-primary-light/40"><td className="px-4"><NameCell name={s.nama} sub={`NIS ${s.nis}`} /></td><td><div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1" role="radiogroup" aria-label={`Status ${s.nama}`}>{opts.map(([l, cls]) => <button key={l} role="radio" aria-checked={st[s.id] === l} onClick={() => setSt({ ...st, [s.id]: l })} className={cn('px-2.5 h-8 rounded-lg text-xs font-bold', st[s.id] === l ? cls : 'text-muted hover:bg-white')}>{l}</button>)}</div></td><td className="pr-4"><input aria-label={`Keterangan ${s.nama}`} value={ket[s.id] ?? ''} onChange={(e) => setKet({ ...ket, [s.id]: e.target.value })} placeholder="Opsional" className="h-9 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></td></tr>)}</tbody></table></div></Card></div></div>
      {full && <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-center p-6 fade text-center" role="dialog" aria-modal aria-label="Barcode layar penuh"><button aria-label="Tutup layar penuh" onClick={() => setFull(false)} className="absolute top-5 right-5 w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X /></button>
        <div className="text-lg font-bold text-primary-dark">{subjectById(o.subjectId).nama} • {kelasById(o.kelasId).nama} • Pertemuan {n}</div><div className="p-6 border-4 border-primary/30 rounded-[32px] mt-6"><QRCodeSVG value={qr} size={Math.min(420, window.innerWidth - 120)} fgColor="#1F2937" /></div><div className="text-5xl font-extrabold tracking-[0.25em] mt-6">{c}</div><div className="text-2xl font-bold mt-3 tabular-nums" style={{ color: left < 10 ? '#DC2626' : '#0E86C7' }}>Berlaku {mm}</div><Btn variant="outline" className="mt-6" icon={<RefreshCw size={16} />} onClick={refresh}>Perbarui Barcode</Btn></div>}
    </div>
  )
}

export function RekapPresensi() {
  const { offId } = useParams(); const o = offeringById(offId!); const { toast } = useApp(); const ss = studentsOf(o.kelasId); const [bulan, setBulan] = useState('Semua'); const [q, setQ] = useState('')
  const sesi = sesiOf(o.id).slice(-12); const cols = sesi.filter((s) => bulan === 'Semua' || s.tanggal.getMonth() === Number(bulan))
  const rows = ss.filter((s) => s.nama.toLowerCase().includes(q.toLowerCase())).map((s) => { const cells = cols.map((c) => seedStat(s.id, c.no, s.hadir)); const h = cells.filter((x) => x === 'H').length; return { s, cells, h, p: cols.length ? Math.round((h / cols.length) * 100) : 0 } })
  const tone: Record<string, string> = { H: 'bg-green-100 text-green-800', I: 'bg-blue-100 text-blue-800', S: 'bg-amber-100 text-amber-800', A: 'bg-red-100 text-red-800' }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Presensi', to: '/guru/presensi' }, { l: kelasById(o.kelasId).nama, to: `/guru/presensi/${o.id}` }, { l: 'Rekap' })} title="Rekap Presensi" subtitle={offeringTitle(o)} actions={<Btn icon={<Download size={18} />} onClick={() => { download(`rekap-presensi-${o.kode}.csv`); toast('Rekap presensi diekspor') }}>Ekspor</Btn>} />
      <Card className="!p-0 overflow-hidden"><div className="p-4 flex flex-wrap items-center gap-3 border-b border-line"><SearchBar value={q} onChange={setQ} placeholder="Cari nama siswa" className="w-72" /><Select aria-label="Filter bulan" value={bulan} onChange={(e) => setBulan(e.target.value)} options={[{ v: 'Semua', l: 'Semua bulan' }, { v: '8', l: 'September' }, { v: '9', l: 'Oktober' }]} className="w-48" /><div className="ml-auto flex gap-2 text-xs">{Object.entries({ H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alpa' }).map(([k, v]) => <span key={k} className={cn('px-2 py-1 rounded-lg font-bold', tone[k])}>{k} = {v}</span>)}</div></div>
        <div className="overflow-auto max-h-[640px]"><table className="text-sm w-full"><thead className="sticky top-0 z-10 bg-gray-50 text-xs text-muted"><tr><th className="px-4 h-12 text-left sticky left-0 bg-gray-50 min-w-[220px]">SISWA</th>{cols.map((c) => <th key={c.no} className="px-2 min-w-[52px] text-center"><div>P{c.no}</div><div className="font-normal">{c.tanggal.getDate()}/{c.tanggal.getMonth() + 1}</div></th>)}<th className="px-4">%</th></tr></thead>
          <tbody>{rows.map(({ s, cells, p }) => <tr key={s.id} className={cn('border-t border-line h-12', p < 75 && 'bg-red-50/70')}><td className={cn('px-4 sticky left-0 font-semibold', p < 75 ? 'bg-red-50' : 'bg-white')}><div className="flex items-center gap-2"><Avatar name={s.nama} size={28} />{s.nama}</div></td>{cells.map((c, i) => <td key={i} className="px-1 text-center"><span className={cn('inline-flex w-8 h-8 rounded-lg items-center justify-center text-xs font-bold', tone[c])}>{c}</span></td>)}<td className="px-4"><b className={cn(p < 75 && 'text-danger')}>{p}%</b>{p < 75 && <Badge tone="red" className="ml-2">&lt; 75%</Badge>}</td></tr>)}</tbody></table></div></Card></div>
  )
}

// ---------- Penilaian ----------
export function Penilaian() {
  const [sp, setSp] = useSearchParams(); const { pengampu, tugas: realTugas } = useGuruData();
  const mineOff = useMemo(() => pengampu.length > 0 ? pengampu.map(fromPengampuToOffering) : guruOfferings('t1'), [pengampu]);
  const mine = realTugas.length > 0
    ? realTugas.filter((t: any) => t.status !== 'Draft').map((t: any) => ({ ...t, off: t.id_pengampu }))
    : tugas.filter((t) => mineOff.some((o: any) => o.id === t.off) && t.gStatus !== 'Draft');
  const tid = sp.get('tugas') ?? (mine.length > 0 ? mine[0].id : tugas[0]?.id ?? '');
  
  return <PenilaianInner key={tid} tid={tid} mine={mine} setTid={(v) => setSp({ tugas: v })} />
}
function PenilaianInner({ tid, mine, setTid }: { tid: string; mine: typeof tugas; setTid: (v: string) => void }) {
  const t = mine.find((x: any) => x.id === tid) ? mine.find((x: any) => x.id === tid)! : tugasById(tid); const { toast } = useApp(); const [subs, setSubs] = useState(() => subSiswa(tid)); const [f, setF] = useState('Semua'); const [open, setOpen] = useState<string | null>(null)
  const [nilai, setNilai] = useState(''); const [fb, setFb] = useState(''); const [err, setErr] = useState('')
  const cnt = (s: string) => subs.filter((x) => x.status === s).length; const wait = cnt('Dikumpulkan') + cnt('Terlambat')
  const rows = subs.filter((s) => f === 'Semua' || (f === 'Menunggu' ? s.status === 'Dikumpulkan' || s.status === 'Terlambat' : s.status === f))
  const cur = subs.find((s) => s.id === open)
  const openRow = (id: string) => { const s = subs.find((x) => x.id === id)!; setOpen(id); setNilai(s.nilai?.toString() ?? ''); setFb(''); setErr('') }
  const save = (next: boolean) => { const n = Number(nilai); if (nilai === '' || isNaN(n) || n < 0 || n > t.maks) return setErr(`Nilai harus antara 0 dan ${t.maks}`); const l = subs.map((s) => (s.id === open ? { ...s, nilai: n, status: 'Dinilai' as TStatus } : s)); setSubs(l); toast(`Nilai ${cur!.siswa.nama} tersimpan`)
    if (next) { const nx = l.find((s) => (s.status === 'Dikumpulkan' || s.status === 'Terlambat') && s.id !== open); if (nx) { setOpen(nx.id); setNilai(''); setFb(''); setErr('') } else { setOpen(null); toast('Semua pengumpulan sudah dinilai', 'info') } } else setOpen(null) }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Penilaian' })} title="Penilaian" subtitle="Nilai pengumpulan tugas siswa dan berikan umpan balik" actions={<Select aria-label="Pilih tugas" value={tid} onChange={(e) => setTid(e.target.value)} options={mine.map((m: any) => ({ v: m.id, l: `${m.judul} — ${kelasById(offeringById(m.off).kelasId).nama}` }))} className="w-96 max-w-full" />} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">{[['Total Siswa', subs.length, 'text-ink'], ['Belum Mengumpulkan', cnt('Belum Dikumpulkan'), 'text-muted'], ['Menunggu Dinilai', wait, 'text-accent'], ['Sudah Dinilai', cnt('Dinilai'), 'text-primary-dark']].map(([l, v, c]) => <Card key={l as string} className="!p-4"><div className="text-sm text-muted font-semibold">{l}</div><div className={cn('text-3xl font-extrabold', c as string)}>{v}</div></Card>)}</div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.siswa.nama} searchPlaceholder="Cari nama siswa" onRow={(r) => openRow(r.id)} filters={<Chips value={f} onChange={setF} options={[{ k: 'Semua', l: 'Semua' }, { k: 'Menunggu', l: 'Menunggu Dinilai' }, { k: 'Dinilai', l: 'Dinilai' }, { k: 'Belum Dikumpulkan', l: 'Belum' }]} />}
        cols={[{ key: 'siswa', header: 'Siswa', sort: (r) => r.siswa.nama, render: (r) => <NameCell name={r.siswa.nama} sub={`NIS ${r.siswa.nis}`} /> }, { key: 'berkas', header: 'Berkas', render: (r) => r.berkas === '-' ? <span className="text-muted">-</span> : <span className="flex items-center gap-1.5 text-accent"><FileText size={15} />{r.berkas}</span> }, { key: 'waktu', header: 'Waktu Kumpul' }, { key: 'status', header: 'Status', render: (r) => <StatusBadge s={r.status} /> }, { key: 'nilai', header: 'Nilai', sort: (r) => r.nilai ?? -1, render: (r) => <b>{r.nilai ?? '-'}</b> }]}
        actions={(r) => [{ l: r.status === 'Belum Dikumpulkan' ? 'Lihat' : 'Nilai', icon: <Pencil size={16} />, onClick: () => openRow(r.id) }]} />
      <Drawer open={!!cur} onClose={() => setOpen(null)} title="Penilaian Tugas" footer={cur && cur.status !== 'Belum Dikumpulkan' ? <><Btn variant="outline" onClick={() => save(false)}>Simpan</Btn><Btn icon={<Check size={16} />} onClick={() => save(true)}>Simpan dan Berikutnya</Btn></> : <Btn variant="outline" onClick={() => setOpen(null)}>Tutup</Btn>}>
        {cur && <><NameCell name={cur.siswa.nama} sub={`${kelasById(cur.siswa.kelasId).nama} • ${t.judul}`} /><StatusBadge s={cur.status} />
          {cur.status === 'Belum Dikumpulkan' ? <Empty title="Belum mengumpulkan" text="Siswa belum mengunggah berkas untuk tugas ini." /> : <>
            <div className="border border-line rounded-2xl overflow-hidden"><div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-sm font-semibold"><FileText size={16} className="text-accent" />{cur.berkas}<span className="ml-auto text-xs text-muted">{cur.waktu}</span></div><div className="bg-gray-100 p-5"><div className="bg-white rounded-lg p-6 shadow-soft min-h-60"><div className="font-extrabold">{t.judul}</div><div className="text-xs text-muted mb-4">{cur.siswa.nama} • {kelasById(cur.siswa.kelasId).nama}</div>{[100, 92, 96, 70, 100, 84].map((w, i) => <div key={i} className="h-2.5 rounded bg-gray-200 mb-2.5" style={{ width: `${w}%` }} />)}</div></div></div>
            <Input label={`Nilai (0 - ${t.maks})`} type="number" value={nilai} onChange={(e) => setNilai(e.target.value)} error={err} /><Textarea label="Umpan Balik" value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Tulis umpan balik untuk siswa..." />
            <div><div className="text-xs font-bold text-muted mb-2">TEMPLATE KOMENTAR</div><div className="flex flex-wrap gap-2">{KATEGORI_KOMENTAR.map((k) => <button key={k} onClick={() => setFb(k)} className="text-xs px-3 py-1.5 rounded-full border border-line hover:bg-primary-light text-left">{k}</button>)}</div></div></>}</>}
      </Drawer></div>
  )
}

// ---------- Hasil Kuis Guru ----------
export function KuisHasilGuru() {
  const { id } = useParams(); const k = kuisById(id!); const o = offeringById(k.off); const ss = studentsOf(o.kelasId)
  const rows = ss.map((s, i) => ({ id: s.id, s, skor: i < k.dikerjakan ? Math.min(100, Math.max(30, (Math.round((s.rata + ((i * 7) % 21) - 10) / 10)) * 10)) : null, waktu: i < k.dikerjakan ? `${8 + ((i * 3) % 12)} menit` : '-' }))
  const done = rows.filter((r) => r.skor !== null); const sk = done.map((r) => r.skor!); const avg = sk.length ? Math.round(sk.reduce((a, b) => a + b, 0) / sk.length) : 0
  const dist = ['<50', '50-59', '60-69', '70-79', '80-89', '90-100'].map((r, i) => ({ r, v: sk.filter((x) => (i === 0 ? x < 50 : i === 5 ? x >= 90 : x >= 50 + i * 10 - 10 && x < 60 + i * 10 - 10)).length }))
  const butir = kuisSoal.map((q, i) => { const p = Math.max(25, Math.min(96, 92 - i * 7 + ((i * 11) % 13))); return { no: i + 1, q: q.q, p, lvl: p >= 75 ? 'Mudah' : p >= 50 ? 'Sedang' : 'Sulit' } })
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Daftar Kuis', to: '/guru/kuis' }, { l: 'Hasil Kuis' })} title={`Hasil: ${k.judul}`} subtitle={offeringTitle(o)} actions={<Btn variant="outline" to="/guru/kuis" icon={<ArrowLeft size={18} />}>Kembali</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6"><Stat icon={<ClipboardCheck />} label="Sudah Mengerjakan" value={`${done.length}/25`} /><Stat icon={<Check />} label="Rata-rata Skor" value={avg} tone="blue" /><Stat icon={<Check />} label="Skor Tertinggi" value={sk.length ? Math.max(...sk) : '-'} /><Stat icon={<X />} label="Skor Terendah" value={sk.length ? Math.min(...sk) : '-'} tone="amber" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Distribusi Skor</CardTitle><div style={{ height: 260 }}><ResponsiveContainer><BarChart data={dist}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="r" tickLine={false} axisLine={false} fontSize={12} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[10, 10, 0, 0]}>{dist.map((_, i) => <Cell key={i} fill={i % 2 ? '#2563EB' : '#0B3D5F'} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Analisis Butir Soal</CardTitle><ul className="space-y-3 max-h-[270px] overflow-auto pr-1">{butir.map((b) => <li key={b.no} className="flex items-center gap-3 text-sm"><b className="w-7">{b.no}</b><span className="flex-1 truncate">{b.q}</span><span className="w-24"><Progress value={b.p} tone={b.p >= 75 ? 'green' : b.p >= 50 ? 'amber' : 'red'} /></span><span className="w-10 text-right font-bold">{b.p}%</span><Badge tone={b.lvl === 'Mudah' ? 'green' : b.lvl === 'Sedang' ? 'amber' : 'red'}>{b.lvl}</Badge></li>)}</ul></Card></div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.s.nama} searchPlaceholder="Cari nama siswa" cols={[{ key: 's', header: 'Siswa', sort: (r) => r.s.nama, render: (r) => <NameCell name={r.s.nama} sub={`NIS ${r.s.nis}`} /> }, { key: 'skor', header: 'Skor', sort: (r) => r.skor ?? -1, render: (r) => <b>{r.skor ?? '-'}</b> }, { key: 'waktu', header: 'Durasi' }, { key: 'st', header: 'Status', render: (r) => <StatusBadge s={r.skor === null ? 'Belum Dikumpulkan' : 'Selesai'} /> }]} /></div>
  )
}

// ---------- Bank Soal ----------
export function BankSoal() {
  const { toast, confirm } = useApp(); const [items, setItems] = useState<Soal[]>(bankSoal); const [mp, setMp] = useState('Semua'); const [lv, setLv] = useState('Semua'); const [modal, setModal] = useState<null | { edit?: string }>(null); const [pv, setPv] = useState<Soal | null>(null)
  const blank = { q: '', opsi: ['', '', '', ''], kunci: 0, mapel: 'Basis Data', level: 'Mudah' as Soal['level'], bab: 'Bab 3 - SQL Dasar' }; const [f, setF] = useState(blank); const [e, setE] = useState('')
  const rows = items.filter((s) => (mp === 'Semua' || s.mapel === mp) && (lv === 'Semua' || s.level === lv))
  const open = (s?: Soal) => { setF(s ? { q: s.q, opsi: [...s.opsi], kunci: s.kunci, mapel: s.mapel, level: s.level, bab: s.bab } : blank); setE(''); setModal({ edit: s?.id }) }
  const save = () => { if (!f.q.trim() || f.opsi.some((o) => !o.trim())) return setE('Pertanyaan dan keempat pilihan jawaban wajib diisi'); if (modal?.edit) setItems(items.map((s) => (s.id === modal.edit ? { ...s, ...f } : s))); else setItems([{ ...f, id: 'q' + Date.now(), dibuat: '29 Okt 2026' }, ...items]); setModal(null); toast(modal?.edit ? 'Soal diperbarui' : 'Soal berhasil ditambahkan') }
  const lt = (l: string) => (l === 'Mudah' ? 'green' : l === 'Sedang' ? 'amber' : 'red')
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Bank Soal' })} title="Bank Soal" subtitle="Kumpulan soal pilihan ganda yang dapat digunakan ulang pada kuis" actions={<Btn icon={<Plus size={18} />} onClick={() => open()}>Tambah Soal</Btn>} />
      <DataTable rows={rows} pageSize={10} selectable searchText={(s) => s.q + s.bab} searchPlaceholder="Cari soal" onRow={setPv} bulk={[{ l: 'Hapus', icon: <Trash2 size={15} />, danger: true, onClick: (ids, clear) => confirm({ title: 'Hapus Soal Terpilih?', message: `${ids.length} soal akan dihapus dari Bank Soal.`, danger: true, onOk: () => { setItems(items.filter((s) => !ids.includes(s.id))); clear(); toast(`${ids.length} soal dihapus`) } }) }]}
        filters={<><Select aria-label="Filter mata pelajaran" value={mp} onChange={(x) => setMp(x.target.value)} options={['Semua', 'Basis Data', 'Pemrograman Web', 'Matematika']} className="!w-48 !h-11" /><Select aria-label="Filter tingkat" value={lv} onChange={(x) => setLv(x.target.value)} options={['Semua', 'Mudah', 'Sedang', 'Sulit']} className="!w-36 !h-11" /></>}
        cols={[{ key: 'q', header: 'Soal', sort: (s) => s.q, render: (s) => <span className="line-clamp-2 max-w-md font-semibold">{s.q}</span> }, { key: 'mapel', header: 'Mapel', sort: (s) => s.mapel }, { key: 'bab', header: 'Bab' }, { key: 'level', header: 'Tingkat', render: (s) => <Badge tone={lt(s.level)}>{s.level}</Badge> }, { key: 'dibuat', header: 'Dibuat' }]}
        actions={(s) => [{ l: 'Pratinjau', icon: <Eye size={16} />, onClick: () => setPv(s) }, { l: 'Edit', icon: <Pencil size={16} />, onClick: () => open(s) }, { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => confirm({ title: 'Hapus Soal?', message: 'Soal akan dihapus dari Bank Soal.', danger: true, onOk: () => { setItems(items.filter((x) => x.id !== s.id)); toast('Soal dihapus') } }) }]} />
      <Modal open={!!modal} onClose={() => setModal(null)} wide title={modal?.edit ? 'Edit Soal' : 'Tambah Soal'} footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn icon={<Save size={16} />} onClick={save}>Simpan</Btn></>}>
        <Textarea label="Pertanyaan" value={f.q} onChange={(x) => setF({ ...f, q: x.target.value })} /><div className="grid sm:grid-cols-2 gap-3">{f.opsi.map((o, j) => <div key={j} className="flex items-end gap-2"><div className="flex-1"><Input label={`Pilihan ${'ABCD'[j]}`} value={o} onChange={(x) => setF({ ...f, opsi: f.opsi.map((y, z) => (z === j ? x.target.value : y)) })} /></div><button type="button" aria-label={`Kunci ${'ABCD'[j]}`} onClick={() => setF({ ...f, kunci: j })} className={cn('h-11 w-11 rounded-xl border-2 flex items-center justify-center', f.kunci === j ? 'bg-primary border-primary text-white' : 'border-line')}><Check size={18} /></button></div>)}</div>{e && <p role="alert" className="text-danger text-xs font-semibold">{e}</p>}
        <div className="grid sm:grid-cols-3 gap-3"><Select label="Mata Pelajaran" value={f.mapel} onChange={(x) => setF({ ...f, mapel: x.target.value })} options={['Basis Data', 'Pemrograman Web', 'Matematika']} /><Input label="Bab" value={f.bab} onChange={(x) => setF({ ...f, bab: x.target.value })} /><Select label="Tingkat" value={f.level} onChange={(x) => setF({ ...f, level: x.target.value as Soal['level'] })} options={['Mudah', 'Sedang', 'Sulit']} /></div></Modal>
      <Drawer open={!!pv} onClose={() => setPv(null)} title="Pratinjau Soal">{pv && <><div className="flex gap-2"><Badge tone="blue">{pv.mapel}</Badge><Badge tone={lt(pv.level)}>{pv.level}</Badge></div><h3 className="text-lg font-bold leading-7">{pv.q}</h3><div className="space-y-2">{pv.opsi.map((o, j) => <div key={j} className={cn('flex items-center gap-3 border-2 rounded-xl p-3 text-sm', j === pv.kunci ? 'border-primary bg-primary-light font-bold' : 'border-line')}><span className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold', j === pv.kunci ? 'bg-primary text-white' : 'bg-gray-100')}>{'ABCD'[j]}</span>{o}{j === pv.kunci && <Badge tone="green" className="ml-auto">Kunci</Badge>}</div>)}</div><p className="text-xs text-muted">{pv.bab} • Dibuat {pv.dibuat}</p></>}</Drawer></div>
  )
}

// ---------- Rekap Nilai ----------
export function RekapNilaiKelas() {
  const { offId } = useParams(); const o = offeringById(offId!); const { toast } = useApp(); const rows = nilaiKelas(o.kelasId, o.id)
  const avg = Math.round(rows.reduce((a, r) => a + r.akhir, 0) / rows.length)
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: '/guru/kelas' }, { l: subjectById(o.subjectId).nama, to: `/guru/kelas/${offId}` }, { l: 'Rekap Nilai' })} title="Rekap Nilai Kelas" subtitle={offeringTitle(o)} actions={<Btn icon={<FileSpreadsheet size={18} />} onClick={() => { download(`rekap-nilai-${o.kode}.csv`); toast('Berkas Excel berhasil diekspor') }}>Ekspor Excel</Btn>} />
      <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Check />} label="Rata-rata Nilai Akhir" value={avg} /><Stat icon={<Check />} label="Nilai Tertinggi" value={Math.max(...rows.map((r) => r.akhir))} tone="blue" /><Stat icon={<X />} label="Di Bawah KKM (75)" value={rows.filter((r) => r.akhir < 75).length} tone="red" /></div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.siswa.nama} searchPlaceholder="Cari nama siswa" cols={[{ key: 's', header: 'Siswa', sort: (r) => r.siswa.nama, render: (r) => <NameCell name={r.siswa.nama} sub={`NIS ${r.siswa.nis}`} /> }, { key: 'tugas', header: 'Tugas (30%)', sort: (r) => r.tugas }, { key: 'kuis', header: 'Kuis (20%)', sort: (r) => r.kuis }, { key: 'uts', header: 'UTS (30%)', sort: (r) => r.uts }, { key: 'uas', header: 'UAS (20%)', sort: (r) => r.uas }, { key: 'akhir', header: 'Nilai Akhir', sort: (r) => r.akhir, render: (r) => <b className={cn(r.akhir < 75 && 'text-danger')}>{r.akhir}</b> }, { key: 'k', header: 'Keterangan', render: (r) => <Badge tone={r.akhir >= 75 ? 'green' : 'red'}>{r.akhir >= 75 ? 'Tuntas' : 'Remedial'}</Badge> }]} /></div>
  )
}
export function RekapNilaiPick() {
  const { pengampu, loading } = useGuruData();
  const offs = useMemo(() => pengampu.length > 0 ? pengampu.map(fromPengampuToOffering) : guruOfferings('t1'), [pengampu]);
  
  if (loading) return <div className="p-8 text-center text-muted">Memuat data kelas...</div>;
  
  return <div><PageHeader crumbs={useCrumbs({ l: 'Rekap Nilai' })} title="Rekap Nilai Kelas" subtitle="Pilih kelas" /><div className="grid md:grid-cols-2 gap-5">{offs.map((o) => <Link key={o.id} to={`/guru/rekap-nilai/${o.id}`}><Card hover><b className="uppercase">{offeringTitle(o)}</b><div className="text-sm text-muted mt-1">Rata-rata nilai {o.rata}</div></Card></Link>)}</div></div>
}

// ---------- Media Library ----------
export function MediaLibrary() {
  const { toast, confirm } = useApp(); const [files, setFiles] = useState(mediaFiles); const [q, setQ] = useState(''); const [t, setT] = useState('semua'); const [up, setUp] = useState(false)
  const list = files.filter((f) => (t === 'semua' || f.tipe === t) && f.nama.toLowerCase().includes(q.toLowerCase()))
  const ytMap: Record<string, string> = { f4: 'qz0aGYrrlhU', f7: 'UB1O30fR-EE' }
  
  // MediaLibrary still uses local state since file upload requires storage integration
  // which needs Supabase Storage configuration. The dummy data provides a functional UI.
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Media Library' })} title="Media Library" subtitle="Dokumen, gambar, dan tautan YouTube yang pernah Anda unggah" actions={<Btn icon={<Upload size={18} />} onClick={() => setUp(true)}>Unggah Berkas</Btn>} />
      <div className="flex flex-wrap gap-3 mb-5"><SearchBar value={q} onChange={setQ} placeholder="Cari berkas" className="w-80 max-w-full" /><Chips value={t} onChange={setT} options={[{ k: 'semua', l: 'Semua', n: files.length }, { k: 'dokumen', l: 'Dokumen' }, { k: 'gambar', l: 'Gambar' }, { k: 'youtube', l: 'YouTube' }]} /></div>
      {list.length === 0 ? <Card><Empty title="Berkas tidak ditemukan" text="Coba kata kunci atau jenis berkas lain." /></Card> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{list.map((f) => <Card key={f.id} hover pad={false} className="overflow-hidden group">
        {f.tipe === 'youtube' ? <YtThumb id={ytMap[f.id] ?? 'qz0aGYrrlhU'} className="h-36" /> : <div className={cn('h-36 flex items-center justify-center', fileTone(f.tipe))}><FileIcon t={f.tipe} size={44} /></div>}
        <div className="p-4"><div className="font-bold text-sm truncate">{f.nama}</div><div className="text-xs text-muted mt-0.5">{f.ukuran} • {f.tgl}</div><div className="flex justify-between mt-3"><Badge tone={f.tipe === 'dokumen' ? 'blue' : f.tipe === 'gambar' ? 'purple' : 'red'}>{f.tipe}</Badge><button aria-label="Hapus berkas" className="text-danger p-1 rounded-lg hover:bg-red-50" onClick={() => confirm({ title: 'Hapus Berkas?', message: `"${f.nama}" akan dihapus dari Media Library.`, danger: true, onOk: () => { setFiles(files.filter((x) => x.id !== f.id)); toast('Berkas dihapus') } })}><Trash2 size={17} /></button></div></div></Card>)}</div>}
      <Modal open={up} onClose={() => setUp(false)} title="Unggah Berkas" footer={<Btn onClick={() => { setUp(false); toast('Berkas ditambahkan ke Media Library') }}>Selesai</Btn>}><Dropzone multiple accept="PDF, DOCX, PNG, JPG (maks. 20 MB)" onDone={(n) => setFiles((s) => [{ id: 'u' + Date.now(), nama: 'Berkas-Baru-' + n + '.pdf', tipe: 'dokumen', ukuran: '1,1 MB', tgl: '29 Okt 2026' }, ...s])} /></Modal></div>
  )
}
export { Library, Expand, Search, Link, fmtBatas, fmtTglPendek, kuis, Field, Segmented, ArrowLeft }
