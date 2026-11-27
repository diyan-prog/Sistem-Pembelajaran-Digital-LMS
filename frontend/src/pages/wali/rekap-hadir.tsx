import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Badge, Btn, Card, DataTable, NameCell, PageHeader, Progress, Select, cn, download } from '@/components/ui'
import { useApp } from '@/context'
import { kelasById, rekapHadirKelas, useData } from '@/lib/data'
import { waliKelasId } from './common'

// Nama bulan diselaraskan dengan BULAN_S di static.ts agar filter konsisten.
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function WaliRekapHadir() {
  useData()
  const kid = waliKelasId(); const kelasNama = kid ? kelasById(kid).nama : '-'
  const [b, setB] = useState('Semua'); const { toast } = useApp()
  const bulanIdx = b === 'Semua' ? undefined : BULAN.indexOf(b)
  const rows = rekapHadirKelas(kid, bulanIdx === -1 ? undefined : bulanIdx)
  const sum = (k: 'h' | 'i' | 'sk' | 'a') => rows.reduce((a, r) => a + r[k], 0)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Rekap Kehadiran' }]} title="Rekap Kehadiran" subtitle={`Rekap kehadiran seluruh mata pelajaran • ${kelasNama}`} actions={<Btn icon={<Download size={18} />} onClick={() => { download(`rekap-kehadiran-${kelasNama}.csv`); toast('Rekap kehadiran diekspor') }}>Ekspor</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">{[['Total Hadir', sum('h'), 'green'], ['Total Izin', sum('i'), 'blue'], ['Total Sakit', sum('sk'), 'amber'], ['Total Alpa', sum('a'), 'red']].map(([l, v, t]) => <Card key={l as string} className="!p-4"><Badge tone={t as string}>{l}</Badge><div className="text-3xl font-extrabold mt-2">{v}</div></Card>)}</div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.siswa.nama} searchPlaceholder="Cari nama siswa" filters={<Select aria-label="Filter bulan" value={b} onChange={(e) => setB(e.target.value)} options={['Semua', ...BULAN]} className="!w-44 !h-11" />}
        cols={[{ key: 's', header: 'Siswa', sort: (r) => r.siswa.nama, render: (r) => <Link to={`/wali/siswa/${r.id}`}><NameCell name={r.siswa.nama} sub={`NIS ${r.siswa.nis}`} /></Link> }, { key: 'h', header: 'Hadir', sort: (r) => r.h }, { key: 'i', header: 'Izin', sort: (r) => r.i }, { key: 'sk', header: 'Sakit', sort: (r) => r.sk }, { key: 'a', header: 'Alpa', sort: (r) => r.a }, { key: 'total', header: 'Total Sesi', sort: (r) => r.total }, { key: 'p', header: 'Persentase', sort: (r) => r.p, render: (r) => <div className="flex items-center gap-2 w-36"><Progress value={r.p} tone={r.p >= 75 ? 'green' : 'red'} className="flex-1" /><b className={cn(r.p < 75 && 'text-danger')}>{r.p}%</b></div> }]} /></div>
  )
}
