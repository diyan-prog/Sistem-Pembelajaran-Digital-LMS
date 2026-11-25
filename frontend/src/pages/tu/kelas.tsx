import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, School, UserPlus, Users } from 'lucide-react'
import { Btn, Card, DataTable, NameCell, PageHeader, Stat, StatusBadge, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { adminList, fetchProfilesGo, fetchSiswaGo } from '@/services/api-go'
import { createKelas, deleteKelas, fetchJurusan, fetchKelas, fetchUsers, updateKelas } from '@/services/akademik'
import type { Kelas } from '@/services/akademik'
import { Crud } from './components'

type KelasGo = Kelas

export function DataKelas() {
  const nav = useNavigate()
  const [teachers, setTeachers] = useState<any[]>([])
  const [jurusan, setJurusan] = useState<{ id: string; kode: string; nama: string }[]>([])

  useEffect(() => {
    fetchUsers('guru').then(setTeachers).catch(() => {})
    fetchJurusan().then(setJurusan).catch(() => {})
  }, [])

  return <Crud<KelasGo> singular="Kelas" title="Data Kelas" subtitle="Kelola rombongan belajar, wali kelas, dan ruang" rows={[]} onRowOpen={(k) => nav(`/tu/kelas/${k.id}`)}
    onFetch={fetchKelas}
    onCreate={async (f) => {
      const res = await createKelas({
        name: f.nama,
        grade: Number(f.tingkat),
        major: f.jurusan,
        academic_year: '2026/2027',
        tingkat: Number(f.tingkat),
        jurusan_id: f.jurusan_id || '',
        wali_kelas_id: f.wali || '',
      });
      return { ...res, id: res.id } as KelasGo;
    }}
    onUpdate={async (id, f) => {
      await updateKelas(id, {
        name: f.nama, grade: Number(f.tingkat), major: f.jurusan,
        tingkat: Number(f.tingkat), jurusan_id: f.jurusan_id || '',
        wali_kelas_id: f.wali || '',
      });
    }}
    onDelete={deleteKelas}
    searchText={(k) => k.name}
    filterDefs={[{ k: 'tg', l: 'Tingkat', options: ['10', '11', '12'], get: (k) => String(k.grade) }, { k: 'jr', l: 'Jurusan', options: jurusan.map((j) => j.kode), get: (k) => k.major }]}
    cols={[{ key: 'nama', header: 'Kelas', sort: (k: KelasGo) => k.name, render: (k: KelasGo) => <div><b>{k.name}</b></div> }, { key: 'jurusan', header: 'Jurusan', render: (k: KelasGo) => k.major }, { key: 'wali', header: 'Wali Kelas', render: (k: KelasGo) => teachers.find((t) => t.id === k.wali_kelas_id)?.full_name || '-' }, { key: 'n', header: 'Siswa', render: (k: KelasGo) => String(k.tingkat ?? '-') }]}
    fields={[
      { k: 'nama', l: 'Nama Kelas', req: true },
      { k: 'tingkat', l: 'Tingkat', options: ['10', '11', '12'] },
      { k: 'jurusan_id', l: 'Jurusan', options: jurusan.map((j) => ({ v: j.id, l: j.nama })) },
      { k: 'jurusan', l: 'Kode Jurusan', options: jurusan.map((j) => j.kode) },
      { k: 'wali', l: 'Wali Kelas', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) },
    ]}
    toForm={(k) => ({ nama: k.name, tingkat: String(k.grade), jurusan: k.major, jurusan_id: k.jurusan_id || '', wali: k.wali_kelas_id || '' })}
    fromForm={(f, o) => ({ ...(o ?? {}), name: f.nama, grade: Number(f.tingkat), tingkat: Number(f.tingkat), major: f.jurusan, jurusan_id: f.jurusan_id, wali_kelas_id: f.wali } as KelasGo)} />
}

export function KelasDetailTU() {
  const { id } = useParams()
  const { toast } = useApp()
  const [k, setK] = useState<KelasGo | null>(null)
  const [siswa, setSiswa] = useState<any[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [jurusan, setJurusan] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    Promise.all([
      adminList<KelasGo>('classes'),
      fetchSiswaGo(),
      adminList<any>('pengampu'),
      fetchJurusan(),
      fetchProfilesGo(),
    ]).then(([kelas, s, p, j, t]) => {
      setK(kelas.find((x) => x.id === id) || null)
      setSiswa(s.filter((x) => x.kelas_id === id))
      setMapel(p.filter((x) => x.id_kelas === id))
      setJurusan(j)
      setTeachers(t)
    }).catch(() => {})
  }, [id])

  if (!k) return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: 'Detail' })} title="Kelas" /><Card><p className="text-muted">Memuat data kelas...</p></Card></div>

  const jurusanNama = jurusan.find((j) => j.id === k.jurusan_id)?.nama || k.major
  const wali = teachers.find((t) => t.id === k.wali_kelas_id)?.full_name || '-'

  return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: k.name })} title={`Kelas ${k.name}`} subtitle={`${jurusanNama} • Wali: ${wali}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to="/tu/kelas">Kembali</Btn><Btn icon={<UserPlus size={18} />} onClick={() => toast('Tambah siswa dilakukan menu Data Siswa')}>Tambah Siswa</Btn></>} />
    <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={siswa.length} /><Stat icon={<BookOpen />} label="Mata Pelajaran" value={mapel.length} tone="blue" /><Stat icon={<School />} label="Tahun Ajaran" value={k.academic_year} tone="amber" /></div>
    <DataTable rows={siswa} pageSize={10} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari siswa" cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS' }, { key: 'status', header: 'Status', render: (s) => <StatusBadge s={s.status} /> }]} /></div>
}
