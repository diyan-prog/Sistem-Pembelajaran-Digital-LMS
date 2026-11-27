import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, FileText, Pencil } from 'lucide-react'
import { Btn, Card, Chips, DataTable, Drawer, Empty, Input, NameCell, PageHeader, Select, StatusBadge, Textarea, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { KATEGORI_KOMENTAR, kelasById, offeringById, subSiswa, tugas, tugasById, type TStatus } from '@/lib/data'
import { myTugas } from './common'

// ---------- Penilaian ----------
export function Penilaian() {
  const [sp, setSp] = useSearchParams()
  const mine = myTugas().filter((t) => t.gStatus !== 'Draft')
  const tid = sp.get('tugas') ?? (mine.length > 0 ? mine[0].id : tugas[0]?.id ?? '')
  
  return <PenilaianInner key={tid} tid={tid} mine={mine} setTid={(v) => setSp({ tugas: v })} />
}
export function PenilaianInner({ tid, mine, setTid }: { tid: string; mine: typeof tugas; setTid: (v: string) => void }) {
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
