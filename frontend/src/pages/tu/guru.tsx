import { Avatar, NameCell, StatusBadge } from '@/components/ui'
import { createGuru, deleteUser, fetchUsers, updateGuru } from '@/services/akademik'
import { Crud, Det, em, nm } from './components'

export function DataGuru() {
  return <Crud singular="Guru" title="Data Guru" subtitle="Kelola data guru dan staf pengajar" rows={[]}
    onFetch={() => fetchUsers('guru')}
    onCreate={createGuru}
    onUpdate={updateGuru}
    onDelete={deleteUser}
    searchText={(t: any) => t.full_name + (t.nip_nis || '')}
    filterDefs={[{ k: 'st', l: 'Status', options: ['Aktif', 'Cuti'], get: (t: any) => t.status || 'Aktif' }]}
    cols={[{ key: 'nama', header: 'Guru', sort: (t: any) => t.full_name, render: (t: any) => <NameCell name={t.full_name} sub={t.email} /> }, { key: 'nip', header: 'NIP', render: (t: any) => t.nip_nis }, { key: 'status', header: 'Status', render: (t: any) => <StatusBadge s={t.status || 'Aktif'} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nip', l: 'NIP', req: true }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Cuti'] }]}
    toForm={(t: any) => ({ nama: t.full_name, nip: t.nip_nis || '', email: t.email, status: t.status || 'Aktif' })} 
    fromForm={(f, o) => ({ ...(o ?? {}), full_name: f.nama, nip_nis: f.nip, email: f.email, status: f.status } as any)}
    detail={(t: any) => <><div className="text-center"><Avatar name={t.full_name} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{t.full_name}</h3><StatusBadge s={t.status || 'Aktif'} /></div><Det items={[['NIP', t.nip_nis], ['Email', t.email]]} /></>} />
}
