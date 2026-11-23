import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Award, ClipboardCheck, Megaphone, Pencil, Send, Trash2 } from 'lucide-react'
import { Avatar, Btn, Card, CardTitle, DataTable, Input, Modal, NameCell, PageHeader, StatusBadge, Tabs, Textarea, cn, useCrumbs, useTab } from '@/components/ui'
import { useApp } from '@/context'
import { ClassBrowser, ClassHeader, KuisCard, classAnn } from '@/pages/shared'
import { kelasById, offeringById, offeringTitle, students, studentsOf, subjectById } from '@/mocks'
import { KelolaMateri } from './materi'
import { TugasListGuru } from './tugas'
import { KuisListGuru } from './kuis'

export function KelasDetailGuru() {
  const { id } = useParams(); const o = offeringById(id!); const [tab, setTab] = useTab('beranda'); const { toast, confirm } = useApp(); const nav = useNavigate()
  const [anns, setAnns] = useState(() => classAnn(o)); const [f, setF] = useState({ t: '', d: '' }); const [e, setE] = useState<Record<string, string>>({}); const [edit, setEdit] = useState<string | null>(null)
  const ss = studentsOf(o.kelasId)
  const post = () => { const x: Record<string, string> = {}; if (!f.t.trim()) x.t = 'Judul wajib diisi'; if (f.d.trim().length < 10) x.d = 'Isi minimal 10 karakter'; setE(x); if (Object.keys(x).length) return; if (edit) setAnns(anns.map((a) => (a.id === edit ? { ...a, t: f.t, d: f.d } : a))); else setAnns([{ id: 'a' + Date.now(), t: f.t, d: f.d, w: '29 Okt 2026' }, ...anns]); setF({ t: '', d: '' }); setEdit(null); toast(edit ? 'Pengumuman diperbarui' : 'Pengumuman berhasil dipublikasikan') }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: '/guru/kelas' }, { l: subjectById(o.subjectId).nama })} title="Halaman Kelas" subtitle="Kelola materi, presensi, tugas, kuis, dan nilai kelas ini" /><ClassHeader o={o} mode="guru" />
      <Tabs className="mb-6" tabs={[{ v: 'beranda', l: 'Beranda Kelas' }, { v: 'materi', l: 'Materi' }, { v: 'presensi', l: 'Presensi' }, { v: 'tugas', l: 'Tugas' }, { v: 'kuis', l: 'Kuis' }, { v: 'nilai', l: 'Rekap Nilai' }, { v: 'siswa', l: 'Siswa', n: ss.length }]} value={tab} onChange={setTab} />
      {tab === 'beranda' && <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start"><Card><CardTitle icon={<Megaphone size={20} className="text-primary" />}>{edit ? 'Edit Pengumuman' : 'Buat Pengumuman'}</CardTitle><div className="space-y-4"><Input label="Judul" value={f.t} onChange={(x) => setF({ ...f, t: x.target.value })} error={e.t} /><Textarea label="Isi Pengumuman" value={f.d} onChange={(x) => setF({ ...f, d: x.target.value })} error={e.d} /><p className="text-xs text-muted">Pengumuman bersifat satu arah; siswa tidak dapat berkomentar.</p><div className="flex gap-2"><Btn onClick={post} icon={<Send size={16} />}>{edit ? 'Simpan' : 'Publikasikan'}</Btn>{edit && <Btn variant="outline" onClick={() => { setEdit(null); setF({ t: '', d: '' }) }}>Batal</Btn>}</div></div></Card>
        <div className="space-y-4"><h3 className="text-[22px] font-bold">Pengumuman Kelas</h3>{anns.map((a) => <Card key={a.id}><div className="flex items-start gap-3"><div className="flex-1"><div className="text-xs text-muted mb-1">{a.w}</div><h4 className="font-bold">{a.t}</h4><p className="text-sm text-muted mt-1 leading-6">{a.d}</p></div><Btn variant="ghost" className="!px-2" aria-label="Edit" onClick={() => { setEdit(a.id); setF({ t: a.t, d: a.d }) }}><Pencil size={17} /></Btn><Btn variant="ghost" className="!px-2" aria-label="Hapus" onClick={() => confirm({ title: 'Hapus Pengumuman?', message: `"${a.t}" akan dihapus.`, danger: true, onOk: () => { setAnns(anns.filter((x) => x.id !== a.id)); toast('Pengumuman dihapus') } })}><Trash2 size={17} className="text-danger" /></Btn></div></Card>)}</div></div>}
      {tab === 'materi' && <KelolaMateri offId={o.id} embedded />}
      {tab === 'presensi' && <div className="space-y-4"><Card className="flex flex-wrap items-center justify-between gap-4"><div><b>Pertemuan terlaksana: {o.done} dari {o.total} sesi</b><p className="text-sm text-muted">Kelola presensi manual, mulai sesi, atau lihat rekap.</p></div><div className="flex gap-3"><Btn variant="outline" to={`/guru/presensi/${o.id}/rekap`}>Rekap Presensi</Btn><Btn to={`/guru/presensi/${o.id}`} icon={<ClipboardCheck size={18} />}>Daftar Pertemuan</Btn></div></Card></div>}
      {tab === 'tugas' && <TugasListGuru offId={o.id} />}{tab === 'kuis' && <KuisListGuru offId={o.id} />}
      {tab === 'nilai' && <Card className="flex flex-wrap items-center justify-between gap-4"><div><b>Rata-rata nilai kelas: {o.rata}</b><p className="text-sm text-muted">Lihat matriks nilai dengan bobot dan nilai akhir seluruh siswa.</p></div><Btn to={`/guru/rekap-nilai/${o.id}`} icon={<Award size={18} />}>Buka Rekap Nilai</Btn></Card>}
      {tab === 'siswa' && <SiswaKelasTable kelasId={o.kelasId} />}
      <span className="hidden">{nav.length}</span>
    </div>
  )
}
export function SiswaKelasTable({ kelasId }: { kelasId: string }) {
  const [d, setD] = useState<string | null>(null); const s = students.find((x) => x.id === d)
  return <><DataTable rows={studentsOf(kelasId)} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari nama atau NIS" onRow={(s) => setD(s.id)} cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={kelasById(s.kelasId).nama} /> }, { key: 'nis', header: 'NIS', sort: (s) => s.nis }, { key: 'jk', header: 'JK', render: (s) => (s.jk === 'L' ? 'Laki-laki' : 'Perempuan') }, { key: 'hadir', header: 'Kehadiran', sort: (s) => s.hadir, render: (s) => <span className={cn('font-bold', s.hadir < 75 && 'text-danger')}>{s.hadir}%</span> }, { key: 'rata', header: 'Rata-rata Nilai', sort: (s) => s.rata }, { key: 'st', header: 'Status', render: (s) => <StatusBadge s={s.risiko ? 'Berisiko' : 'Aman'} /> }]} />
    <Modal open={!!s} onClose={() => setD(null)} title="Profil Siswa">{s && <div className="text-center"><Avatar name={s.nama} size={72} className="mx-auto" /><h4 className="font-bold text-lg mt-2">{s.nama}</h4><p className="text-sm text-muted">NIS {s.nis} â€¢ {kelasById(s.kelasId).nama}</p><div className="grid grid-cols-3 gap-3 mt-4">{[['Kehadiran', s.hadir + '%'], ['Nilai', s.rata], ['Tugas Belum', s.belum]].map(([a, b]) => <div key={a as string} className="bg-gray-50 rounded-xl py-3"><div className="font-extrabold text-xl">{b}</div><div className="text-xs text-muted">{a}</div></div>)}</div></div>}</Modal></>
}
export function DaftarSiswaPage() {
  const { id } = useParams(); const o = offeringById(id!)
  return <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: '/guru/kelas' }, { l: subjectById(o.subjectId).nama, to: `/guru/kelas/${id}` }, { l: 'Daftar Siswa' })} title="Daftar Siswa Kelas" subtitle={offeringTitle(o)} /><SiswaKelasTable kelasId={o.kelasId} /></div>
}

export const GuruKelasSaya = () => <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya' })} title="Kelas Saya" subtitle="Seluruh kelas yang Anda ampu" /><ClassBrowser mode="guru" withFilter to="/guru/kelas" /></div>
