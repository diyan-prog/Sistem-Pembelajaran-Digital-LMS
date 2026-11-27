import { useMemo, useState } from 'react'
import { Btn, Card, ClassCard, Empty, SearchBar, Select, Tabs, useTab } from '@/components/ui'
import { archived, kelasById, myOfferings, subjectById, teacherById, useData } from '@/lib/data'

export function ClassBrowser({ mode, withFilter, to }: { mode: 'siswa' | 'guru'; withFilter?: boolean; to: string }) {
  useData()
  const [tab, setTab] = useTab('aktif', 'kelas'); const [q, setQ] = useState(''); const [sem, setSem] = useState('Semua'); const [kl, setKl] = useState('Semua')
  const active = myOfferings()
  const arch = archived
  const base = tab === 'aktif' ? active : arch
  const list = useMemo(() => base.filter((o) => { const t = `${subjectById(o.subjectId).nama} ${o.kode} ${teacherById(o.guru).sapaan} ${o.co.map((c) => teacherById(c).sapaan).join(' ')}`.toLowerCase(); return t.includes(q.toLowerCase()) && (sem === 'Semua' || o.semester === sem) && (kl === 'Semua' || kelasById(o.kelasId).nama === kl) }), [base, q, sem, kl])
  const title = tab === 'aktif' ? 'Kelas Aktif' : 'Kelas Arsip'
  const semesters = [...new Set([...active, ...arch].map((o) => o.semester).filter(Boolean))]
  return (
    <div>
      <Tabs tabs={[{ v: 'aktif', l: 'Kelas Aktif' }, { v: 'arsip', l: 'Kelas Arsip' }]} value={tab} onChange={setTab} />
      <h2 className="text-[22px] font-bold mt-6">{title}</h2>
      <p className="text-muted text-sm mt-1 mb-4">{tab === 'aktif' ? (mode === 'siswa' ? `Kamu memiliki ${active.length} kelas sesuai jadwal pelajaran pada semester ini` : `Kamu mengampu ${active.length} kelas pada semester ini`) : `Terdapat ${arch.length} kelas dari semester sebelumnya`}</p>
      <div className="flex flex-wrap gap-3 mb-5"><SearchBar large className="flex-1 min-w-[260px]" value={q} onChange={setQ} placeholder="Cari berdasarkan mata pelajaran, kode kelas, atau nama guru" />
        {withFilter && <><Select aria-label="Filter semester" value={sem} onChange={(e) => setSem(e.target.value)} options={['Semua', ...semesters]} className="!h-12 w-56" />{mode === 'guru' && <Select aria-label="Filter kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...[...new Set(active.map((o) => kelasById(o.kelasId).nama).filter((n) => n !== '-'))]]} className="!h-12 w-40" />}</>}</div>
      {list.length === 0 ? <Card><Empty title="Kelas tidak ditemukan" text="Tidak ada kelas yang cocok dengan pencarianmu." action={<Btn variant="outline" onClick={() => { setQ(''); setSem('Semua'); setKl('Semua') }}>Reset Pencarian</Btn>} /></Card>
        : <div className="grid md:grid-cols-2 gap-5">{list.map((o) => <ClassCard key={o.id} o={o} mode={mode} to={`${to}/${o.id}`} />)}</div>}
    </div>
  )
}
