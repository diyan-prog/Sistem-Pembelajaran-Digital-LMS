import { Calendar, MapPin, User } from 'lucide-react'
import { Card, Progress } from '@/components/ui'
import { fmtSlot, jurusanNama, kelasById, offeringTitle, pct, subjectById, teacherById, useData, type Offering } from '@/lib/data'

export function ClassHeader({ o, mode }: { o: Offering; mode: 'siswa' | 'guru' }) {
  useData()
  const p = pct(o); const k = kelasById(o.kelasId); const g = teacherById(o.guru)
  const slot = o.jadwal[0]
  const progres = o.total ? Math.round((o.done / o.total) * 100) : 0
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] leading-9 font-extrabold uppercase">{offeringTitle(o)}</h1><p className="font-semibold mt-1">{jurusanNama(k.jurusan)} â€¢ <span className="italic font-normal text-muted">{o.semester}</span></p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
            <div className="flex items-center gap-2"><User size={16} className="text-muted" />{g.sapaan}{o.co.length > 0 && <span className="text-accent underline">dan {o.co.length} lainnya</span>}</div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-muted" />Ruang {slot?.ruang ?? '-'}</div>
            <div className="flex items-center gap-2 sm:col-span-2"><Calendar size={16} className="text-muted" />{o.jadwal.length ? o.jadwal.map(fmtSlot).join(' • ') : 'Jadwal belum diatur'}</div>
          </div>
        </div>
        <div className="w-full sm:w-72 bg-gray-50 rounded-2xl p-4">
          {mode === 'siswa' ? <><div className="flex justify-between text-sm font-semibold"><span>Kehadiran: {o.hadir} dari {o.done} sesi</span><span className="font-extrabold">{p}%</span></div><Progress value={p} className="mt-2" /></>
            : <><div className="flex justify-between text-sm font-semibold"><span>Pertemuan: {o.done} dari {o.total} sesi</span><span className="font-extrabold">{progres}%</span></div><Progress value={progres} className="mt-2" /><div className="text-sm mt-3 font-semibold">Rata-rata nilai kelas: <span className="text-primary-dark">{o.rata}</span></div></>}
        </div>
      </div>
    </Card>
  )
}
export const classAnn = (o: Offering) => [
  { id: 'a1', t: `Persiapan pertemuan berikutnya: ${subjectById(o.subjectId).nama}`, d: 'Harap membaca modul pada tab Materi sebelum pertemuan berikutnya dan membawa perangkat belajar masing-masing.', w: '28 Okt 2026' },
  { id: 'a2', t: 'Pengingat pengumpulan tugas', d: 'Tugas harus dikumpulkan sebelum batas waktu melalui sistem. Keterlambatan akan ditandai otomatis.', w: '26 Okt 2026' },
  { id: 'a3', t: 'Jadwal kuis bab berjalan', d: 'Kuis akan dibuka selama beberapa hari dengan waktu pengerjaan terbatas. Pastikan koneksi internet stabil.', w: '22 Okt 2026' },
]