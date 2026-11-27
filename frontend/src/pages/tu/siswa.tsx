import { useEffect, useState } from 'react'
import { Avatar, NameCell, StatusBadge } from '@/components/ui'
import { fetchKelasGo, fetchSiswaGo, createSiswaGo, updateSiswaGo, deleteSiswaGo } from '@/services/api-go'
import { Crud, Det, em, nm } from './components'

export function DataSiswa() {
  const [classList, setClassList] = useState<any[]>([])
  useEffect(() => { fetchKelasGo().then(setClassList).catch(() => {}) }, [])
  // API /admin/classes memakai field `name` (bukan `nama` seperti tabel legacy `kelas`).
  const kelasNama = (id?: string | null) => classList.find((k) => k.id === id)?.name ?? classList.find((k) => k.id === id)?.nama ?? ''

  return <Crud singular="Siswa" title="Data Siswa" subtitle="Kelola data seluruh siswa SMK Negeri 2 Indramayu" rows={[]} importer
    onFetch={async () => {
      const data = await fetchSiswaGo();
      return (data || []).map((d) => ({
        id: d.id,
        nama: d.nama || 'Tanpa Nama',
        nis: d.nis || '-',
        email: d.email || '-',
        status: d.status || 'Aktif',
        kelasId: (d.kelas_id || null) as string,
        jk: 'L',
        hp: '-',
        alamat: 'Indramayu'
      }));
    }}
    onCreate={async (f) => {
      const res = await createSiswaGo({
        nama: f.nama, nis: f.nis, email: f.email, kelas_id: f.kelasId, status: f.status
      });
      return { id: res.id, ...f };
    }}
    onUpdate={async (id, f) => {
      await updateSiswaGo(id, {
        nama: f.nama, nis: f.nis, email: f.email, kelas_id: f.kelasId, status: f.status
      });
    }}
    onDelete={async (id) => { await deleteSiswaGo(id); }}
    searchText={(s) => s.nama + s.nis}
    // API /admin/classes memakai field `name` (bukan `nama` seperti tabel legacy `kelas`).
    filterDefs={[{ k: 'kelas', l: 'Kelas', options: classList.map((k) => kelasNama(k.id)), get: (s) => kelasNama((s as any)?.kelasId) || '' }, { k: 'st', l: 'Status', options: ['Aktif', 'Nonaktif'], get: (s) => s.status }]}
    cols={[{ key: 'nama', header: 'Siswa', sort: (s: any) => s.nama, render: (s: any) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS', sort: (s: any) => s.nis }, { key: 'kelas', header: 'Kelas', sort: (s: any) => kelasNama((s as any)?.kelasId), render: (s: any) => kelasNama((s as any)?.kelasId) || '-' }, { key: 'status', header: 'Status', render: (s: any) => <StatusBadge s={s.status} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nis', l: 'NIS', req: true }, { k: 'kelasId', l: 'Kelas', options: classList.map((k) => ({ v: k.id, l: kelasNama(k.id) })) }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Nonaktif'] }]}
    toForm={(s) => ({ nama: s.nama, nis: s.nis, kelasId: s.kelasId || '', email: s.email, status: s.status })}
    fromForm={(f, o) => ({ ...(o ?? {}), ...f } as any)}
    detail={(s) => <><div className="text-center"><Avatar name={s.nama} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{s.nama}</h3><StatusBadge s={s.status} /></div><Det items={[['NIS', s.nis], ['Kelas', kelasNama((s as any)?.kelasId) || '-'], ['Email', s.email]]} /></>} />
}