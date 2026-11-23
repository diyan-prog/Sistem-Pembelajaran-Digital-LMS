import { useState } from 'react'
import { Download } from 'lucide-react'
import { Badge, Btn, DataTable, NameCell, PageHeader, Select, download, useCrumbs } from '@/components/ui'
import { logs } from '@/mocks'

export function LogAktivitas() {
  const [r, setR] = useState('Semua'); const [m, setM] = useState('Semua'); const rows = logs.filter((l) => (r === 'Semua' || l.role === r) && (m === 'Semua' || l.modul === m))
  return <div><PageHeader crumbs={useCrumbs({ l: 'Log Aktivitas' })} title="Log Aktivitas" subtitle="Rekam jejak aktivitas pengguna di dalam sistem" actions={<Btn variant="outline" icon={<Download size={18} />} onClick={() => download('log-aktivitas.csv')}>Ekspor</Btn>} />
    <DataTable rows={rows} pageSize={10} searchText={(l) => l.user + l.aksi} searchPlaceholder="Cari pengguna atau aktivitas" filters={<><Select aria-label="Peran" value={r} onChange={(e) => setR(e.target.value)} options={['Semua', 'Siswa', 'Guru', 'Tata Usaha']} className="!w-40 !h-11" /><Select aria-label="Modul" value={m} onChange={(e) => setM(e.target.value)} options={['Semua', ...new Set(logs.map((l) => l.modul))]} className="!w-44 !h-11" /></>}
      cols={[{ key: 'waktu', header: 'Waktu', sort: (l: any) => -l.id }, { key: 'user', header: 'Pengguna', sort: (l: any) => l.user, render: (l: any) => <NameCell name={l.user} sub={l.role} /> }, { key: 'aksi', header: 'Aktivitas' }, { key: 'modul', header: 'Modul', render: (l: any) => <Badge tone="blue">{l.modul}</Badge> }, { key: 'ip', header: 'Alamat IP' }]} /></div>
}
