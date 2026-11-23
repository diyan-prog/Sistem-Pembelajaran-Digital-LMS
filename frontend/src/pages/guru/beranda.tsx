import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, Card, CardTitle } from '@/components/ui'
import { ClassBrowser, ScheduleCard } from '@/pages/shared'
import { guruOfferings, kelasById, offeringById, offeringTitle, scheduleOf, studentsOf, subSiswa, tugas } from '@/data'
import { mine, myTugas, waiting } from './common'

export function GuruBeranda() {
  const tg = myTugas().filter((t) => t.gStatus !== 'Draft').map((t) => ({ t, n: waiting(t.id) })).filter((x) => x.n > 0)
  const total = tg.reduce((a, b) => a + b.n, 0)
  const feed = myTugas().filter((t) => t.gStatus === 'Aktif').slice(0, 4).flatMap((t) => subSiswa(t.id).filter((s) => s.status !== 'Belum Dikumpulkan').slice(0, 2).map((s) => ({ s, t })))
  const perhatian = mine().flatMap((o) => studentsOf(o.kelasId)).filter((s) => s.risiko).filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i).slice(0, 5)
  const chart = mine().map((o) => ({ kelas: kelasById(o.kelasId).nama, rata: o.rata, kehadiran: Math.round((o.hadir / o.done) * 100) }))
  return (
    <div>
      <div className="mb-6"><h1 className="text-[28px] font-extrabold">Selamat pagi, Bu Sari!</h1><p className="text-muted">Hari ini Anda mengajar {scheduleOf(mine(), 4).length} kelas. Ada {total} pengumpulan menunggu penilaian.</p></div>
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="space-y-6"><ScheduleCard offs={mine()} mode="guru" />
          <Card><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold flex items-center gap-2">Perlu Dinilai<span className="min-w-6 h-6 px-2 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">{total}</span></h3><Link to="/guru/penilaian" className="text-sm font-bold text-accent hover:underline">Lihat Semua</Link></div>
            <ul className="space-y-1">{tg.slice(0, 5).map(({ t, n }) => <li key={t.id}><Link to={`/guru/penilaian?tugas=${t.id}`} className="flex gap-3 p-3 -mx-3 rounded-2xl hover:bg-gray-50"><span className="w-10 h-10 rounded-full bg-blue-100 text-accent flex items-center justify-center shrink-0"><ClipboardCheck size={19} /></span><span className="min-w-0 flex-1"><b className="block text-sm leading-snug">{t.judul}</b><span className="block text-xs text-muted uppercase">{offeringTitle(offeringById(t.off))}</span></span><Badge tone="amber">{n} menunggu</Badge></Link></li>)}</ul></Card></div>
        <div className="space-y-8 min-w-0"><ClassBrowser mode="guru" to="/guru/kelas" />
          <div className="grid xl:grid-cols-2 gap-6">
            <Card><CardTitle>Pengumpulan Tugas Terbaru</CardTitle><ul className="space-y-3">{feed.slice(0, 6).map(({ s, t }, i) => <li key={i} className="flex items-center gap-3"><Avatar name={s.siswa.nama} /><div className="flex-1 min-w-0 text-sm"><b>{s.siswa.nama}</b><div className="text-muted truncate">{t.judul}</div></div><span className="text-xs text-muted shrink-0">{s.waktu.split(',')[0]}</span></li>)}</ul></Card>
            <Card><CardTitle right={<Link className="text-sm font-bold text-accent" to="/guru/kelas">Semua kelas</Link>}>Siswa Perlu Perhatian</CardTitle><ul className="space-y-3">{perhatian.map((s) => <li key={s.id} className="flex items-center gap-3"><Avatar name={s.nama} /><div className="flex-1 text-sm"><b>{s.nama}</b><div className="text-xs text-muted">{kelasById(s.kelasId).nama}</div></div><div className="text-right text-xs"><Badge tone="red">Hadir {s.hadir}%</Badge><div className="text-muted mt-1">Nilai {s.rata}</div></div></li>)}</ul></Card></div>
          <Card><CardTitle>Rata-rata Nilai per Kelas</CardTitle><div style={{ height: 280 }}><ResponsiveContainer><BarChart data={chart} barGap={6}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="kelas" tickLine={false} axisLine={false} fontSize={12} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} /><Tooltip /><Legend /><Bar dataKey="rata" name="Rata-rata Nilai" fill="#0B3D5F" radius={[8, 8, 0, 0]} /><Bar dataKey="kehadiran" name="Kehadiran (%)" fill="#2563EB" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card></div>
      </div>
    </div>
  )
}
