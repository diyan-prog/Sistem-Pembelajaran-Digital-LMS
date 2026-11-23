import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, School, UserPlus, Users } from 'lucide-react'
import { Btn, DataTable, NameCell, PageHeader, Stat, StatusBadge, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { kelasById, jurusanNama, offerings, studentsOf, teacherById } from '@/data'
import { createKelas, deleteKelas, fetchJurusan, fetchKelas, fetchUsers, updateKelas } from '@/services/akademik'
import { Crud } from './components'

export function DataKelas() {
  const nav = useNavigate(); const [teachers, setTeachers] = useState<any[]>([]); const [jurusan, setJurusan] = useState<string[]>([])
  useEffect(() => { fetchUsers('guru').then(setTeachers).catch(() => {}); fetchJurusan().then(setJurusan).catch(() => {}) }, [])
  return <Crud singular="Kelas" title="Data Kelas" subtitle="Kelola rombongan belajar, wali kelas, dan ruang" rows={[]} onRowOpen={(k) => nav(`/tu/kelas/${k.id}`)}
    onFetch={fetchKelas}
    onCreate={async (f) => {
      const res = await createKelas({ name: f.nama, grade: Number(f.tingkat), major: f.jurusan, academic_year: '2026/2027', wali_kelas_id: f.wali });
      return { ...res, id: res.id };
    }}
    onUpdate={async (id, f) => {
      await updateKelas(id, { name: f.nama, grade: Number(f.tingkat), major: f.jurusan, wali_kelas_id: f.wali });
    }}
    onDelete={deleteKelas}
    searchText={(k: any) => k.name}
    filterDefs={[{ k: 'tg', l: 'Tingkat', options: ['10', '11', '12'], get: (k: any) => String(k.grade) }, { k: 'jr', l: 'Jurusan', options: jurusan, get: (k: any) => k.major }]}
    cols={[{ key: 'nama', header: 'Kelas', sort: (k: any) => k.name, render: (k: any) => <div><b>{k.name}</b></div> }, { key: 'jurusan', header: 'Jurusan', render: (k: any) => k.major }, { key: 'wali', header: 'Wali Kelas', render: (k: any) => teachers.find(t => t.id === k.wali_kelas_id)?.full_name || '-' }, { key: 'n', header: 'Siswa', render: () => '-' }]}
    fields={[{ k: 'nama', l: 'Nama Kelas', req: true }, { k: 'tingkat', l: 'Tingkat', options: ['10', '11', '12'] }, { k: 'jurusan', l: 'Jurusan', options: jurusan }, { k: 'wali', l: 'Wali Kelas', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) }]}
    toForm={(k: any) => ({ nama: k.name, tingkat: String(k.grade), jurusan: k.major, wali: k.wali_kelas_id })} fromForm={(f, o) => ({ ...(o ?? {}), name: f.nama, grade: Number(f.tingkat), major: f.jurusan, wali_kelas_id: f.wali } as any)} />
}
export function KelasDetailTU() {
  const { id } = useParams(); const k = kelasById(id!); const { toast } = useApp()
  return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: k.nama })} title={`Kelas ${k.nama}`} subtitle={`${jurusanNama(k.jurusan)} â€¢ Wali: ${teacherById(k.wali).sapaan} â€¢ ${k.ruang}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to="/tu/kelas">Kembali</Btn><Btn icon={<UserPlus size={18} />} onClick={() => toast('Siswa ditambahkan ke kelas')}>Tambah Siswa</Btn></>} />
    <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={25} /><Stat icon={<BookOpen />} label="Mata Pelajaran" value={offerings.filter((o) => o.kelasId === k.id).length} tone="blue" /><Stat icon={<School />} label="Ruang" value={k.ruang} tone="amber" /></div>
    <DataTable rows={studentsOf(k.id)} pageSize={10} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari siswa" cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS' }, { key: 'jk', header: 'Jenis Kelamin', render: (s) => (s.jk === 'L' ? 'Laki-laki' : 'Perempuan') }, { key: 'st', header: 'Status', render: (s) => <StatusBadge s={s.status} /> }]} /></div>
}
