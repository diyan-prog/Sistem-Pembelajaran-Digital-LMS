import { useEffect, useState } from 'react'
import { Avatar, NameCell, StatusBadge } from '@/components/ui'
import { createSiswa, deleteUser, fetchKelas, fetchSiswaKelas, updateSiswa } from '@/services/akademik'
import { Crud, Det, em, nm } from './components'

export function DataSiswa() {
  const [classList, setClassList] = useState<any[]>([])
  useEffect(() => { fetchKelas().then(setClassList).catch(() => {}) }, [])

  return <Crud singular="Siswa" title="Data Siswa" subtitle="Kelola data seluruh siswa SMK Negeri 2 Indramayu" rows={[]} importer 
    onFetch={async () => {
      const data = await fetchSiswaKelas();
      return (data || []).map((d: any) => ({
        id: d.id_siswa,
        nama: d.user?.full_name || 'Tanpa Nama',
        nis: d.user?.nip_nis || '-',
        email: d.user?.email || '-',
        status: d.user?.status || 'Aktif',
        kelasId: d.id_kelas,
        jk: 'L',
        hp: '-',
        alamat: 'Indramayu'
      }));
    }}
    onCreate={async (f) => {
      const res = await createSiswa(f);
      return { id: res.id, ...f };
    }}
    onUpdate={async (id, f) => {
      await updateSiswa(id, f);
    }}
    onDelete={deleteUser}
    searchText={(s) => s.nama + s.nis}
    filterDefs={[{ k: 'kelas', l: 'Kelas', options: classList.map((k) => k.name), get: (s) => classList.find(k => k.id === s.kelasId)?.name || '' }, { k: 'st', l: 'Status', options: ['Aktif', 'Nonaktif'], get: (s) => s.status }]}
    cols={[{ key: 'nama', header: 'Siswa', sort: (s: any) => s.nama, render: (s: any) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS', sort: (s: any) => s.nis }, { key: 'kelas', header: 'Kelas', sort: (s: any) => classList.find(k => k.id === s.kelasId)?.name, render: (s: any) => classList.find(k => k.id === s.kelasId)?.name }, { key: 'status', header: 'Status', render: (s: any) => <StatusBadge s={s.status} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nis', l: 'NIS', req: true }, { k: 'kelasId', l: 'Kelas', options: classList.map((k) => ({ v: k.id, l: k.name })) }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Nonaktif'] }]}
    toForm={(s) => ({ nama: s.nama, nis: s.nis, kelasId: s.kelasId, email: s.email, status: s.status })} 
    fromForm={(f, o) => ({ ...(o ?? {}), ...f } as any)}
    detail={(s) => <><div className="text-center"><Avatar name={s.nama} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{s.nama}</h3><StatusBadge s={s.status} /></div><Det items={[['NIS', s.nis], ['Kelas', classList.find(k => k.id === s.kelasId)?.name || '-'], ['Email', s.email]]} /></>} />
}
