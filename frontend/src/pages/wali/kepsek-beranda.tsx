import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, CalendarCheck, GraduationCap, Medal, Trophy, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardTitle, PageHeader, Select, Stat } from '@/components/ui'
import { kelas, kelasStat, subjects } from '@/lib/data'

const PERIODE: Record<string, number> = { 'Bulan Ini': 0.97, 'Semester Ini': 1, 'Tahun Ajaran': 1.02 }
export function KepsekBeranda() {
  const [kl, setKl] = useState('Semua'); const [mp, setMp] = useState('Semua'); const [pr, setPr] = useState('Semester Ini'); const k = PERIODE[pr]
  const ks = kelasStat.filter((x) => kl === 'Semua' || x.nama === kl); const mf = mp === 'Semua' ? 0 : (mp.length % 5) - 2
  const avgH = Math.round((ks.reduce((a, b) => a + b.hadir, 0) / ks.length) * k); const avgN = Math.round(ks.reduce((a, b) => a + b.nilai, 0) / ks.length + mf)
  const rank = [...kelasStat].sort((a, b) => b.nilai + b.hadir - (a.nilai + a.hadir))
  const tren = ['Jul', 'Agu', 'Sep', 'Okt'].map((b, i) => ({ b, 'Rata-rata Nilai': Math.round(avgN - 6 + i * 2 + (i === 3 ? 0 : 0)), 'Kehadiran': Math.round(avgH + 4 - i * 1.5) }))
  const med = ['text-amber-500', 'text-gray-400', 'text-orange-700']
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda' }]} title="Ringkasan Sekolah" subtitle="Pantauan pembelajaran SMK Negeri 2 Indramayu ΓÇó Mode hanya-lihat" actions={<><Select aria-label="Kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...kelas.map((x) => x.nama)]} className="!w-36" /><Select aria-label="Mata pelajaran" value={mp} onChange={(e) => setMp(e.target.value)} options={['Semua', ...subjects.map((s) => s.nama)]} className="!w-48" /><Select aria-label="Periode" value={pr} onChange={(e) => setPr(e.target.value)} options={Object.keys(PERIODE)} className="!w-44" /></>} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<GraduationCap />} label="Total Siswa" value="1.080" trend="+2,4%" sub="3 jurusan, 36 rombel" /><Stat icon={<Users />} label="Total Guru" value="64" trend="+1,6%" tone="blue" sub="Aktif mengajar" /><Stat icon={<CalendarCheck />} label="Rata-rata Kehadiran" value={`${avgH}%`} trend="-0,8%" tone="amber" /><Stat icon={<Award />} label="Rata-rata Nilai" value={avgN} trend="+3,2%" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Presensi per Kelas</CardTitle><div style={{ height: 290 }}><ResponsiveContainer><BarChart data={ks.map((x) => ({ n: x.nama, v: Math.round(x.hadir * k) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={12} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Kehadiran (%)" radius={[10, 10, 0, 0]} fill="#0B3D5F" /></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Tren Nilai & Kehadiran</CardTitle><div style={{ height: 290 }}><ResponsiveContainer><LineChart data={tren}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="b" tickLine={false} axisLine={false} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="Rata-rata Nilai" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} /><Line type="monotone" dataKey="Kehadiran" stroke="#0B3D5F" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div></Card></div>
      <Card><CardTitle icon={<Trophy size={20} className="text-amber-500" />} right={<Link className="text-sm font-bold text-accent" to="/kepsek/statistik">Statistik detail</Link>}>Peringkat Kelas</CardTitle><ol className="divide-y divide-line">{rank.map((x, i) => <li key={x.id} className="flex items-center gap-4 py-3"><span className="w-10 flex justify-center">{i < 3 ? <Medal className={med[i]} size={28} /> : <b className="text-muted">{i + 1}</b>}</span><div className="flex-1"><b>{x.nama}</b><div className="text-xs text-muted">{x.siswa} siswa ΓÇó {x.berisiko} berisiko</div></div><div className="text-right text-sm"><div>Nilai <b>{x.nilai}</b></div><div className="text-muted">Hadir {x.hadir}%</div></div></li>)}</ol></Card></div>
  )
}
