import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { Badge, Card, CardTitle, DataTable, Empty, PageHeader, Progress, Ring, StatusBadge, Tabs, useCrumbs, useTab } from '@/components/ui'
import { ME_SISWA, kuis, materiOf, nilaiSiswa, offeringById, sesiOf, subjectById, teacherById, tugas } from '@/mocks'
import { ClassBrowser, ClassHeader, KuisCard, classAnn } from '@/pages/shared'
import { MateriList } from './materi'
import { TugasRow } from './tugas-row'
import { shortBatas } from './deadline'

export function SiswaKelasSaya() {
  return <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya' })} title="Kelas Saya" subtitle="Semua kelas mata pelajaran yang kamu ikuti" /><ClassBrowser mode="siswa" withFilter to="/siswa/kelas" /></div>
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
      {tab === 'beranda' && <div className="grid lg:grid-cols-[1fr_380px] gap-6"><div className="space-y-4"><h3 className="text-[22px] font-bold">Pengumuman Kelas</h3>{classAnn(o).map((a) => <Card key={a.id}><div className="flex items-center gap-2 text-xs text-muted mb-1"><Megaphone size={14} />{teacherById(o.guru).sapaan} â€¢ {a.w}</div><h4 className="font-bold">{a.t}</h4><p className="text-sm text-muted mt-1 leading-6">{a.d}</p></Card>)}</div>
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
