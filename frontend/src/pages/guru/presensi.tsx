import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Calendar, CheckCheck, ClipboardCheck, Clock, Download, FileSpreadsheet, FileText, Info, MapPin, Maximize2, Plus, Printer, QrCode, RefreshCw, Save, X } from 'lucide-react'
import { Avatar, Badge, Btn, Card, CardTitle, DataTable, NameCell, PageHeader, Progress, Ring, SearchBar, Select, StatusBadge, cn, download, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { TODAY, addDays, fmtTgl, guruOfferings, kelasById, offeringById, offeringTitle, seedStat, sesiOf, studentsOf, subjectById } from '@/mocks'
import { fetchPresensi } from '@/services/presensi'
import { fromPengampuToOffering } from '@/services/akademik'
import { useGuruData } from '@/hooks/useGuruData'

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
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{offs.map((o) => <Link key={o.id} to={`/guru/presensi/${o.id}`}><Card hover className="h-full"><div className="flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center"><ClipboardCheck /></span><div><b className="block uppercase leading-snug">{offeringTitle(o)}</b><span className="text-xs text-muted">{kelasById(o.kelasId).nama} â€¢ 25 siswa</span></div></div><div className="mt-4 text-sm flex justify-between"><span className="text-muted">Pertemuan terlaksana</span><b>{o.done} / {o.total}</b></div><Progress value={(o.done / o.total) * 100} tone="green" className="mt-2" /></Card></Link>)}</div></div>
}
export function PresensiList() {
  const { offId } = useParams(); const o = offeringById(offId!); const nav = useNavigate(); const { toast } = useApp(); const base = sesiOf(o.id)
  const mk = (n: number, extra = 0) => { const tgl = base[n - 1]?.tanggal ?? addDays(TODAY, (n - o.done - 1) * 7); const seed = (n * 7) % 5; const h = 25 - seed - (n % 3 === 0 ? 1 : 0); const i = n % 4 === 0 ? 1 : 0; const sk = n % 5 === 0 ? 1 : 0; const al = 25 - h - i - sk; return { id: n, n, tgl, tanggal: fmtTgl(tgl), jam: `${o.jadwal[0].mulai} - ${o.jadwal[0].selesai}`, materi: base[n - 1]?.materi ?? ['Pengantar Bab Baru', 'Praktik Terbimbing', 'Studi Kasus', 'Evaluasi Bab'][(n + extra) % 4], h, i, s: sk, a: al, status: n <= o.done ? 'Selesai' : n === o.done + 1 ? 'Berlangsung' : 'Terjadwal' } }
  const [extra, setExtra] = useState(0); const rows = useMemo(() => Array.from({ length: o.done + 4 + extra }, (_, k) => mk(k + 1)).reverse(), [o.id, extra])
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Presensi', to: '/guru/presensi' }, { l: kelasById(o.kelasId).nama })} title={`Daftar Pertemuan: ${subjectById(o.subjectId).nama}`} subtitle={`${offeringTitle(o)} â€¢ ${o.done} dari ${o.total} sesi`} actions={<><Btn variant="outline" to={`/guru/presensi/${o.id}/rekap`} icon={<FileSpreadsheet size={18} />}>Rekap Presensi</Btn><Btn variant="outline" icon={<Plus size={18} />} onClick={() => { setExtra(extra + 1); toast('Pertemuan baru berhasil dibuat') }}>Buat Pertemuan</Btn><Btn icon={<QrCode size={18} />} to={`/guru/presensi/${o.id}/sesi/${o.done + 1}`}>Mulai Presensi</Btn></>} />
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
      <Card className="mb-6 !py-4"><div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">{[[<Calendar size={16} />, fmtTgl(TODAY)], [<Clock size={16} />, `Jam ke-${5}-${6} â€¢ ${slot.mulai} - ${slot.selesai}`], [<FileText size={16} />, subjectById(o.subjectId).nama], [<ClipboardCheck size={16} />, kelasById(o.kelasId).nama], [<MapPin size={16} />, `Ruang ${slot.ruang}`]].map(([i, t], k) => <span key={k} className="flex items-center gap-2 font-semibold"><span className="text-muted">{i}</span>{t}</span>)}</div></Card>
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
        <div className="text-lg font-bold text-primary-dark">{subjectById(o.subjectId).nama} â€¢ {kelasById(o.kelasId).nama} â€¢ Pertemuan {n}</div><div className="p-6 border-4 border-primary/30 rounded-[32px] mt-6"><QRCodeSVG value={qr} size={Math.min(420, window.innerWidth - 120)} fgColor="#1F2937" /></div><div className="text-5xl font-extrabold tracking-[0.25em] mt-6">{c}</div><div className="text-2xl font-bold mt-3 tabular-nums" style={{ color: left < 10 ? '#DC2626' : '#0E86C7' }}>Berlaku {mm}</div><Btn variant="outline" className="mt-6" icon={<RefreshCw size={16} />} onClick={refresh}>Perbarui Barcode</Btn></div>}
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
