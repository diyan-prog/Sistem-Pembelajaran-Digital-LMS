import { useState } from 'react'
import { DataTable, Drawer, NameCell, PageHeader, Progress } from '@/components/ui'
import { keaktifanGuru, subjectById } from '@/data'

export function KepsekGuru() {
  const [d, setD] = useState<string | null>(null); const g = keaktifanGuru.find((x) => x.id === d)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/kepsek/beranda' }, { l: 'Keaktifan Guru' }]} title="Keaktifan Guru" subtitle="Aktivitas guru dalam mengelola materi, tugas, kuis, dan presensi" />
      <DataTable rows={keaktifanGuru} pageSize={10} searchText={(t) => t.nama} searchPlaceholder="Cari nama guru" onRow={(t) => setD(t.id)} cols={[{ key: 'nama', header: 'Guru', sort: (t) => t.nama, render: (t) => <NameCell name={t.nama} sub={subjectById(t.mapel).nama} /> }, { key: 'materi', header: 'Materi', sort: (t) => t.materi }, { key: 'tugas', header: 'Tugas', sort: (t) => t.tugas }, { key: 'kuis', header: 'Kuis', sort: (t) => t.kuis }, { key: 'presensi', header: 'Presensi Terisi', sort: (t) => t.presensi, render: (t) => <div className="flex gap-2 items-center w-36"><Progress value={t.presensi} tone={t.presensi >= 85 ? 'green' : 'amber'} className="flex-1" /><b>{t.presensi}%</b></div> }, { key: 'terakhir', header: 'Aktivitas Terakhir' }]} actions={(t) => [{ l: 'Lihat Detail', onClick: () => setD(t.id) }]} />
      <Drawer open={!!g} onClose={() => setD(null)} title="Detail Keaktifan Guru">{g && <><NameCell name={g.nama} sub={`NIP ${g.nip}`} /><div className="grid grid-cols-2 gap-3">{[['Materi diunggah', g.materi], ['Tugas dibuat', g.tugas], ['Kuis dibuat', g.kuis], ['Presensi terisi', g.presensi + '%'], ['Kelas diampu', g.kelasN], ['Aktivitas terakhir', g.terakhir]].map(([a, b]) => <div key={a as string} className="bg-gray-50 rounded-2xl p-4"><div className="text-xs text-muted">{a}</div><div className="font-extrabold text-lg">{b}</div></div>)}</div><h4 className="font-bold">Aktivitas Terbaru</h4><ul className="space-y-2 text-sm">{['Mengunggah materi pertemuan terbaru', 'Menyimpan presensi sesi hari ini', 'Menilai 6 pengumpulan tugas', 'Membuat pengumuman kelas'].map((a, i) => <li key={a} className="flex gap-3 items-center border border-line rounded-xl p-3"><span className="w-2 h-2 rounded-full bg-primary" />{a}<span className="ml-auto text-xs text-muted">{i + 1} hari lalu</span></li>)}</ul></>}</Drawer></div>
  )
}
