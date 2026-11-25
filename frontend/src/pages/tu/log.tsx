import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Badge, Btn, DataTable, NameCell, PageHeader, Select, download, useCrumbs } from '@/components/ui'
import { adminList } from '@/services/api-go'

interface LogGo {
  id: string;
  user: string;
  role: string;
  aksi: string;
  modul: string | null;
  ip_address: string | null;
  waktu: string | null;
}

export function LogAktivitas() {
  const [rows, setRows] = useState<LogGo[]>([])
  const [loading, setLoading] = useState(true)
  const [r, setR] = useState('Semua')
  const [m, setM] = useState('Semua')

  useEffect(() => {
    adminList<LogGo>('log')
      .then((d) => setRows((d || []).sort((a, b) => (b.waktu || '').localeCompare(a.waktu || ''))))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter((l) => (r === 'Semua' || l.role === r) && (m === 'Semua' || l.modul === m))
  const roles = ['Semua', ...new Set(rows.map((l) => l.role).filter(Boolean))]
  const mods = ['Semua', ...new Set(rows.map((l) => l.modul).filter(Boolean) as string[])]

  return <div><PageHeader crumbs={useCrumbs({ l: 'Log Aktivitas' })} title="Log Aktivitas" subtitle="Rekam jejak aktivitas pengguna di dalam sistem" actions={<Btn variant="outline" icon={<Download size={18} />} onClick={() => download('log-aktivitas.csv')}>Ekspor</Btn>} />
    <DataTable rows={filtered} loading={loading} pageSize={10} searchText={(l) => l.user + l.aksi} searchPlaceholder="Cari pengguna atau aktivitas" filters={<><Select aria-label="Peran" value={r} onChange={(e) => setR(e.target.value)} options={roles} className="!w-40 !h-11" /><Select aria-label="Modul" value={m} onChange={(e) => setM(e.target.value)} options={mods} className="!w-44 !h-11" /></>}
      cols={[{ key: 'waktu', header: 'Waktu', sort: (l: any) => l.waktu || '', render: (l: any) => l.waktu ? new Date(l.waktu).toLocaleString('id-ID') : '-' }, { key: 'user', header: 'Pengguna', sort: (l: any) => l.user, render: (l: any) => <NameCell name={l.user} sub={l.role} /> }, { key: 'aksi', header: 'Aktivitas' }, { key: 'modul', header: 'Modul', render: (l: any) => <Badge tone="blue">{l.modul || '-'}</Badge> }, { key: 'ip', header: 'Alamat IP', render: (l: any) => l.ip_address || '-' }]} /></div>
}
