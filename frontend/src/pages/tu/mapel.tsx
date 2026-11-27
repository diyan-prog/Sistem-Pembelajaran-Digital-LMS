import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui'
import { createMapelGo, deleteMapelGo, fetchMapelGo, updateMapelGo, fetchProfilesGo } from '@/services/api-go'
import { Crud, Det } from './components'

export function DataMapel() {
  const [teachers, setTeachers] = useState<any[]>([])
  useEffect(() => { fetchProfilesGo('guru').then(setTeachers).catch(() => {}) }, [])
  return <Crud singular="Mata Pelajaran" title="Data Mata Pelajaran" subtitle="Kelola mata pelajaran umum dan kejuruan" rows={[]}
    onFetch={fetchMapelGo}
    onCreate={createMapelGo}
    onUpdate={updateMapelGo}
    onDelete={deleteMapelGo}
    searchText={(s: any) => s.name + s.code}
    filterDefs={[{ k: 'kel', l: 'Kelompok', options: ['Umum', 'Kejuruan'], get: (s: any) => s.category }]}
    cols={[{ key: 'nama', header: 'Mata Pelajaran', sort: (s: any) => s.name, render: (s: any) => <div className="flex items-center gap-3"><span className="w-3 h-8 rounded-full bg-primary-dark" /><b>{s.name}</b></div> }, { key: 'kode', header: 'Kode', sort: (s: any) => s.code }, { key: 'kelompok', header: 'Kelompok', render: (s: any) => <Badge tone={s.category === 'Umum' ? 'blue' : 'green'}>{s.category}</Badge> }, { key: 'guru', header: 'Guru Utama', render: (s: any) => teachers.find(t => t.id === s.teacher_id)?.full_name || '-' }]}
    fields={[{ k: 'nama', l: 'Nama Mata Pelajaran', req: true }, { k: 'kode', l: 'Kode', req: true, validate: (v) => (v.length > 5 ? 'Maksimal 5 karakter' : '') }, { k: 'kelompok', l: 'Kelompok', options: ['Umum', 'Kejuruan'] }, { k: 'guru', l: 'Guru Utama', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) }]}
    toForm={(s: any) => ({ nama: s.name, kode: s.code, kelompok: s.category, guru: s.teacher_id })} fromForm={(f, o) => ({ ...(o ?? {}), name: f.nama, code: f.kode, category: f.kelompok, teacher_id: f.guru } as any)}
    detail={(s: any) => <><h3 className="font-extrabold text-xl">{s.name}</h3><Det items={[['Kode', s.code], ['Kelompok', s.category], ['Guru utama', teachers.find(t => t.id === s.teacher_id)?.full_name || '-']]} /></>} />
}
