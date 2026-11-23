import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Badge, Btn, Card, DataTable, NameCell, PageHeader, Progress, Select, cn, download } from '@/components/ui'
import { useApp } from '@/context'
import { studentsOf } from '@/mocks'
import { KID } from './common'

export function WaliRekapHadir() {
  const [b, setB] = useState('Semua'); const [q, setQ] = useState(''); const { toast } = useApp(); const f = b === 'Semua' ? 1 : ({ Juli: 0.2, Agustus: 0.22, September: 0.28, Oktober: 0.3 } as Record<string, number>)[b]
  const rows = studentsOf(KID).map((s) => { const total = Math.round(95 * f); const h = Math.round(total * (s.hadir / 100)); const rest = total - h; const i = Math.round(rest * 0.4), sk = Math.round(rest * 0.4); return { id: s.id, s, total, h, i, sk, a: rest - i - sk, p: Math.round((h / total) * 100) } })
  const sum = (k: 'h' | 'i' | 'sk' | 'a') => rows.reduce((a, r) => a + r[k], 0)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Rekap Kehadiran' }]} title="Rekap Kehadiran" subtitle="Rekap kehadiran seluruh mata pelajaran ΓÇó XI RPL 1" actions={<Btn icon={<Download size={18} />} onClick={() => { download('rekap-kehadiran-XI-RPL-1.csv'); toast('Rekap kehadiran diekspor') }}>Ekspor</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">{[['Total Hadir', sum('h'), 'green'], ['Total Izin', sum('i'), 'blue'], ['Total Sakit', sum('sk'), 'amber'], ['Total Alpa', sum('a'), 'red']].map(([l, v, t]) => <Card key={l as string} className="!p-4"><Badge tone={t as string}>{l}</Badge><div className="text-3xl font-extrabold mt-2">{v}</div></Card>)}</div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.s.nama} searchPlaceholder="Cari nama siswa" filters={<Select aria-label="Filter bulan" value={b} onChange={(e) => setB(e.target.value)} options={['Semua', 'Juli', 'Agustus', 'September', 'Oktober']} className="!w-44 !h-11" />}
        cols={[{ key: 's', header: 'Siswa', sort: (r) => r.s.nama, render: (r) => <Link to={`/wali/siswa/${r.id}`}><NameCell name={r.s.nama} sub={`NIS ${r.s.nis}`} /></Link> }, { key: 'h', header: 'Hadir', sort: (r) => r.h }, { key: 'i', header: 'Izin', sort: (r) => r.i }, { key: 'sk', header: 'Sakit', sort: (r) => r.sk }, { key: 'a', header: 'Alpa', sort: (r) => r.a }, { key: 'total', header: 'Total Sesi' }, { key: 'p', header: 'Persentase', sort: (r) => r.p, render: (r) => <div className="flex items-center gap-2 w-36"><Progress value={r.p} tone={r.p >= 75 ? 'green' : 'red'} className="flex-1" /><b className={cn(r.p < 75 && 'text-danger')}>{r.p}%</b></div> }]} /></div>
  )
}
