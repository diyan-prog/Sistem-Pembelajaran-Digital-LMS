import { useState } from 'react'
import { GraduationCap, LayoutGrid, List, User as UserIcon } from 'lucide-react'
import { Card, DataTable, PageHeader, Progress, Segmented } from '@/components/ui'
import { jurusanNama, kelasById, siswaOfferings, studentsOf, subjectById, teacherById } from '@/mocks'
import { KID } from './common'

export function WaliKelas() {
  const [v, setV] = useState<'grid' | 'list'>('grid'); const offs = siswaOfferings(KID); const k = kelasById(KID)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Kelas Perwalian' }]} title="Kelas Perwalian" subtitle={`${k.nama} ΓÇó ${jurusanNama(k.jurusan)} ΓÇó ${k.ruang}`} actions={<Segmented value={v} onChange={setV} options={[{ v: 'grid', l: <><LayoutGrid size={15} />Grid</> }, { v: 'list', l: <><List size={15} />Daftar</> }]} />} />
      <Card className="mb-6 flex flex-wrap gap-8 items-center"><div className="flex items-center gap-4"><span className="w-14 h-14 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center"><GraduationCap size={28} /></span><div><div className="text-xl font-extrabold">{k.nama}</div><div className="text-sm text-muted">Wali kelas: {teacherById(k.wali).sapaan}</div></div></div>{[['Siswa', 25], ['Mata Pelajaran', offs.length], ['Siswa Berisiko', studentsOf(KID).filter((s) => s.risiko).length]].map(([a, b]) => <div key={a as string}><div className="text-2xl font-extrabold">{b}</div><div className="text-xs text-muted">{a}</div></div>)}</Card>
      {v === 'grid' ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{offs.map((o) => <Card key={o.id} hover><b className="uppercase leading-snug block">{subjectById(o.subjectId).nama}</b><div className="text-sm text-muted mt-1 flex items-center gap-2"><UserIcon size={15} />{teacherById(o.guru).sapaan}</div><div className="text-sm text-muted mt-1">{o.jadwal.map((j) => `${['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][j.hari]} ${j.mulai}`).join(' ΓÇó ')}</div><div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line text-sm"><div><div className="text-muted text-xs">Rata-rata nilai</div><b className="text-lg">{o.rata}</b></div><div><div className="text-muted text-xs">Pertemuan</div><b className="text-lg">{o.done}/{o.total}</b></div></div><Progress value={(o.done / o.total) * 100} className="mt-3" /></Card>)}</div>
        : <DataTable rows={offs} cols={[{ key: 'm', header: 'Mata Pelajaran', sort: (o) => subjectById(o.subjectId).nama, render: (o) => <b>{subjectById(o.subjectId).nama}</b> }, { key: 'g', header: 'Guru', render: (o) => teacherById(o.guru).nama }, { key: 'j', header: 'Jadwal', render: (o) => o.jadwal.map((j) => `${['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][j.hari]} ${j.mulai}`).join(', ') }, { key: 'd', header: 'Pertemuan', render: (o) => `${o.done}/${o.total}` }, { key: 'r', header: 'Rata-rata Nilai', sort: (o) => o.rata, render: (o) => <b>{o.rata}</b> }]} />}</div>
  )
}
