import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, School, UserPlus, Users } from 'lucide-react'
import { Btn, Card, DataTable, NameCell, PageHeader, Stat, StatusBadge, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import {
  createKelasGo, deleteKelasGo, fetchJurusanGo, fetchKelasGo, fetchPengampuGo,
  fetchProfilesGo, fetchSiswaGo, updateKelasGo, type JurusanGo, type KelasGo, type PengampuGo,
  type ProfilGo, type SiswaGo,
} from '@/services/api-go'
import { Crud } from './components'

type Kelas = KelasGo

export function DataKelas() {
  const nav = useNavigate()
  const [teachers, setTeachers] = useState<ProfilGo[]>([])
  const [jurusan, setJurusan] = useState<JurusanGo[]>([])

  useEffect(() => {
    fetchProfilesGo('guru').then(setTeachers).catch(() => {})
    fetchJurusanGo().then(setJurusan).catch(() => {})
  }, [])

  return <Crud<Kelas> singular="Kelas" title="Data Kelas" subtitle="Kelola rombongan belajar, wali kelas, dan ruang" rows={[]} onRowOpen={(k) => nav(`/tu/kelas/${k.id}`)}
    onFetch={() => fetchKelasGo()}
    onCreate={async (f) => {
      const row = await createKelasGo({
        name: f.nama,
        grade: Number(f.tingkat || 10),
        major: f.jurusan || jurusan.find((j) => j.id === f.jurusan_id)?.kode || '',
        academic_year: f.tahun || '2026/2027',
        tingkat: Number(f.tingkat || 10),
        jurusan_id: f.jurusan_id || null,
        wali_kelas_id: f.wali || null,
      });
      return row;
    }}
    onUpdate={async (id, f) => {
      await updateKelasGo(id, {
        name: f.nama,
        grade: Number(f.tingkat || 10),
        major: f.jurusan || jurusan.find((j) => j.id === f.jurusan_id)?.kode || '',
        academic_year: f.tahun || '2026/2027',
        tingkat: Number(f.tingkat || 10),
        jurusan_id: f.jurusan_id || null,
        wali_kelas_id: f.wali || null,
      });
    }}
    onDelete={deleteKelasGo}
    searchText={(k) => k.name}
    filterDefs={[{ k: 'tg', l: 'Tingkat', options: ['10', '11', '12'], get: (k) => String(k.grade) }, { k: 'jr', l: 'Jurusan', options: jurusan.map((j) => j.kode), get: (k) => k.major }]}
    cols={[
      { key: 'nama', header: 'Kelas', sort: (k: KelasGo) => k.name, render: (k: KelasGo) => <div><b>{k.name}</b></div> },
      { key: 'jurusan', header: 'Jurusan', render: (k: KelasGo) => k.major },
      { key: 'wali', header: 'Wali Kelas', render: (k: KelasGo) => teachers.find((t) => t.id === k.wali_kelas_id)?.full_name || '-' },
      { key: 'tahun', header: 'Tahun Ajaran', render: (k: KelasGo) => k.academic_year || '-' },
    ]}
    fields={[
      { k: 'nama', l: 'Nama Kelas', req: true },
      { k: 'tingkat', l: 'Tingkat', options: ['10', '11', '12'] },
      { k: 'jurusan_id', l: 'Jurusan', options: jurusan.map((j) => ({ v: j.id, l: j.nama })) },
      { k: 'tahun', l: 'Tahun Ajaran' },
      { k: 'wali', l: 'Wali Kelas', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) },
    ]}
    toForm={(k) => ({ nama: k.name, tingkat: String(k.grade), jurusan_id: k.jurusan_id || '', tahun: k.academic_year || '2026/2027', wali: k.wali_kelas_id || '' })}
    fromForm={(f, o) => ({
      ...(o ?? {}),
      name: f.nama,
      grade: Number(f.tingkat || 10),
      tingkat: Number(f.tingkat || 10),
      major: f.jurusan || jurusan.find((j) => j.id === f.jurusan_id)?.kode || '',
      jurusan_id: f.jurusan_id || null,
      wali_kelas_id: f.wali || null,
      academic_year: f.tahun || '2026/2027',
    } as KelasGo)} />
}

export function KelasDetailTU() {
  const { id } = useParams()
  const { toast } = useApp()
  const [k, setK] = useState<KelasGo | null>(null)
  const [siswa, setSiswa] = useState<SiswaGo[]>([])
  const [mapel, setMapel] = useState<PengampuGo[]>([])
  const [jurusan, setJurusan] = useState<JurusanGo[]>([])
  const [teachers, setTeachers] = useState<ProfilGo[]>([])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetchKelasGo(),
      fetchSiswaGo(),
      fetchPengampuGo(),
      fetchJurusanGo(),
      fetchProfilesGo(),
    ]).then(([kelas, s, p, j, t]) => {
      setK(kelas.find((x: KelasGo) => x.id === id) || null)
      setSiswa(s.filter((x: SiswaGo) => x.kelas_id === id))
      setMapel(p.filter((x: PengampuGo) => x.id_kelas === id))
      setJurusan(j)
      setTeachers(t)
    }).catch(() => {})
  }, [id])

  if (!k) return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: 'Detail' })} title="Kelas" /><Card><p className="text-muted">Memuat data kelas...</p></Card></div>

  const jurusanNama = jurusan.find((j) => j.id === k.jurusan_id)?.nama || k.major
  const wali = teachers.find((t) => t.id === k.wali_kelas_id)?.full_name || '-'

  return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: k.name })} title={`Kelas ${k.name}`} subtitle={`${jurusanNama} • Wali: ${wali}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to="/tu/kelas">Kembali</Btn><Btn icon={<UserPlus size={18} />} onClick={() => toast('Tambah siswa dilakukan menu Data Siswa')}>Tambah Siswa</Btn></>} />
    <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={siswa.length} /><Stat icon={<BookOpen />} label="Mata Pelajaran" value={mapel.length} tone="blue" /><Stat icon={<School />} label="Tahun Ajaran" value={k.academic_year || '-'} tone="amber" /></div>
    <DataTable rows={siswa} pageSize={10} searchText={(s: SiswaGo) => s.nama + s.nis} searchPlaceholder="Cari siswa" cols={[{ key: 'nama', header: 'Siswa', sort: (s: SiswaGo) => s.nama, render: (s: SiswaGo) => <NameCell name={s.nama} sub={s.email || ''} /> }, { key: 'nis', header: 'NIS' }, { key: 'status', header: 'Status', render: (s: SiswaGo) => <StatusBadge s={s.status || 'aktif'} /> }]} /></div>
}
