import { Avatar, NameCell, StatusBadge } from '@/components/ui'
import { createGuruGo, deleteGuruGo, fetchProfilesGo, updateGuruGo } from '@/services/api-go'
import { Crud, Det, em, nm } from './components'

const displayStatus = (s?: string) => (s?.toLowerCase() === 'nonaktif' ? 'Nonaktif' : 'Aktif')

export function DataGuru() {
  return <Crud singular="Guru" title="Data Guru" subtitle="Kelola data guru dan staf pengajar" rows={[]}
    onFetch={async () => {
      const data = await fetchProfilesGo('guru');
      return (data || []).map((t: any) => ({
        id: t.id,
        nama: t.full_name || 'Tanpa Nama',
        nip: t.nip_nis || '-',
        email: t.email || '-',
        status: displayStatus(t.status),
      }));
    }}
    onCreate={async (f) => {
      const res = await createGuruGo({ nama: f.nama, nip: f.nip, email: f.email, status: f.status });
      return { id: res.id, nama: f.nama, nip: f.nip, email: f.email, status: displayStatus(f.status) };
    }}
    onUpdate={async (id, f) => {
      await updateGuruGo(id, { nama: f.nama, nip: f.nip, email: f.email, status: f.status });
    }}
    onDelete={async (id) => { await deleteGuruGo(id); }}
    searchText={(t: any) => t.nama + (t.nip || '')}
    filterDefs={[{ k: 'st', l: 'Status', options: ['Aktif', 'Nonaktif'], get: (t: any) => t.status }]}
    cols={[{ key: 'nama', header: 'Guru', sort: (t: any) => t.nama, render: (t: any) => <NameCell name={t.nama} sub={t.email} /> }, { key: 'nip', header: 'NIP', render: (t: any) => t.nip }, { key: 'status', header: 'Status', render: (t: any) => <StatusBadge s={t.status} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nip', l: 'NIP', req: true }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Nonaktif'] }]}
    toForm={(t: any) => ({ nama: t.nama, nip: t.nip === '-' ? '' : t.nip, email: t.email === '-' ? '' : t.email, status: t.status })}
    fromForm={(f, o) => ({ ...(o ?? {}), nama: f.nama, nip: f.nip, email: f.email, status: displayStatus(f.status) } as any)}
    detail={(t: any) => <><div className="text-center"><Avatar name={t.nama} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{t.nama}</h3><StatusBadge s={t.status} /></div><Det items={[['NIP', t.nip], ['Email', t.email]]} /></>} />
}
