import { Badge } from '@/components/ui'
import { createJurusanGo, deleteJurusanGo, fetchJurusanGo, updateJurusanGo } from '@/services/api-go'
import { Crud, Det } from './components'

export function DataJurusan() {
  return <Crud singular="Jurusan" title="Data Jurusan" subtitle="Kelola program keahlian" rows={[]}
    onFetch={fetchJurusanGo}
    onCreate={createJurusanGo}
    onUpdate={updateJurusanGo}
    onDelete={deleteJurusanGo}
    searchText={(j: any) => j.nama + j.kode}
    cols={[{ key: 'nama', header: 'Program Keahlian', sort: (j: any) => j.nama, render: (j: any) => <b>{j.nama}</b> }, { key: 'kode', header: 'Kode', render: (j: any) => <Badge tone="green">{j.kode}</Badge> }]}
    fields={[{ k: 'nama', l: 'Nama Program Keahlian', req: true }, { k: 'kode', l: 'Kode', req: true }]} 
    toForm={(j: any) => ({ nama: j.nama, kode: j.kode })} 
    fromForm={(f, o) => ({ ...(o ?? {}), nama: f.nama, kode: f.kode } as any)}
    detail={(j: any) => <><h3 className="font-extrabold text-xl">{j.nama}</h3><Det items={[['Kode', j.kode]]} /></>} />
}
