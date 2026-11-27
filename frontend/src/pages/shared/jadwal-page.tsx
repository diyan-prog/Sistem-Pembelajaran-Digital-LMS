import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Badge, Card, CardTitle, PageHeader, Segmented, Tabs, useCrumbs, useTab } from '@/components/ui'
import { useRole } from '@/context'
import { HARI, TODAY, kalender, myOfferings, offeringTitle, scheduleOf, subjectById, useData } from '@/lib/data'
import { WeeklyGrid } from './weekly-grid'

export function JadwalPage() {
  useData()
  const { role } = useRole(); const guru = role === 'guru'; const offs = myOfferings()
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
          {scheduleOf(offs, d).length === 0 ? <p className="text-sm text-muted">Tidak ada jadwal.</p> : <ul className="space-y-2.5">{scheduleOf(offs, d).map(({ o, s }, i) => <li key={i} className="flex gap-3 items-center"><span className="w-1.5 h-12 rounded-full" style={{ background: subjectById(o.subjectId).warna }} /><div><div className="font-bold text-sm uppercase">{offeringTitle(o)}</div><div className="text-xs text-muted">{s.mulai} - {s.selesai} â€¢ {s.mode} - {s.ruang}</div></div></li>)}</ul>}</Card>)}</div>
      )) : (
        <Card><div className="flex gap-3 flex-wrap mb-4">{['UTS', 'UAS', 'Libur', 'Kegiatan'].map((j) => <Badge key={j} tone={jenisTone(j)}>{j}</Badge>)}</div>
          <ul className="divide-y divide-line">{kalender.map((k) => <li key={k.judul} className="py-3.5 flex items-center gap-4"><div className="w-14 text-center bg-primary-light rounded-xl py-1.5"><div className="text-xs font-bold text-primary-dark">{new Date(k.tgl).toLocaleDateString('id-ID', { month: 'short' })}</div><div className="text-xl font-extrabold">{new Date(k.tgl).getDate()}</div></div><div className="flex-1"><div className="font-bold">{k.judul}</div><div className="text-sm text-muted">{k.akhir !== k.tgl ? `${new Date(k.tgl).getDate()} - ${new Date(k.akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : new Date(k.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><Badge tone={jenisTone(k.jenis)}>{k.jenis}</Badge></li>)}</ul></Card>)}
    </div>
  )
}
