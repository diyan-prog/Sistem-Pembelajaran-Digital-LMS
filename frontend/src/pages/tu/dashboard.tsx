import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, BookOpen, CalendarDays, ClipboardCheck, GraduationCap, Users, School } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Card, CardTitle, PageHeader, Stat } from '@/components/ui'
import { logs } from '@/mocks'
import { fetchSiswaPerJurusan, fetchStats } from '@/services/akademik'

export function TUDashboard() {
  const nav = useNavigate()
  const [stats, setStats] = useState({ siswa: 0, guru: 0, kelas: 0, mapel: 0 });
  const [perJ, setPerJ] = useState<any[]>([]);
  const perT = [{ n: 'Kelas X', v: 372, c: '#0B3D5F' }, { n: 'Kelas XI', v: 361, c: '#2563EB' }, { n: 'Kelas XII', v: 347, c: '#F59E0B' }]
  const warn = [['7 siswa belum memiliki kelas', '/tu/siswa', 'Tetapkan Kelas'], ['2 kelas belum memiliki wali kelas', '/tu/kelas', 'Tetapkan Wali'], ['3 guru belum memiliki mata pelajaran', '/tu/penugasan', 'Tugaskan Guru']]
  const short = [['Tambah Siswa', <GraduationCap />, '/tu/siswa'], ['Tambah Guru', <Users />, '/tu/guru'], ['Atur Jadwal', <CalendarDays />, '/tu/jadwal'], ['Penugasan Guru', <ClipboardCheck />, '/tu/penugasan']] as const

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
    fetchSiswaPerJurusan().then(setPerJ).catch(() => {});
  }, []);

  return (
    <div><PageHeader crumbs={[{ l: 'Dashboard' }]} title="Dashboard Tata Usaha" subtitle="Ringkasan data akademik SMK Negeri 2 Indramayu â€¢ Kamis, 29 Oktober 2026" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<GraduationCap />} label="Total Siswa" value={stats.siswa} trend="+2,4%" /><Stat icon={<Users />} label="Total Guru" value={stats.guru} tone="blue" trend="+1,6%" /><Stat icon={<School />} label="Total Kelas" value={stats.kelas} tone="amber" /><Stat icon={<BookOpen />} label="Mata Pelajaran" value={stats.mapel} tone="green" /></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">{short.map(([l, i, to]) => <Card key={l} hover onClick={() => nav(to)} className="flex items-center gap-4 !p-5"><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center">{i}</span><b>{l}</b></Card>)}</div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mb-6"><Card><CardTitle>Siswa per Jurusan</CardTitle><div style={{ height: 270 }}><ResponsiveContainer><BarChart data={perJ}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[12, 12, 0, 0]} fill="#0B3D5F" barSize={64} /></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Siswa per Tingkat</CardTitle><div className="relative" style={{ height: 270 }}><ResponsiveContainer><PieChart><Pie data={perT} dataKey="v" nameKey="n" innerRadius={66} outerRadius={96} paddingAngle={3} cornerRadius={8}>{perT.map((p) => <Cell key={p.n} fill={p.c} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer><div className="absolute inset-0 -mt-4 flex flex-col items-center justify-center pointer-events-none"><b className="text-2xl">{stats.siswa}</b><span className="text-xs text-muted">Siswa</span></div></div></Card></div>
      <div className="grid lg:grid-cols-2 gap-6"><Card><CardTitle right={<Link className="text-sm font-bold text-accent" to="/tu/log">Lihat semua</Link>}>Log Aktivitas Terbaru</CardTitle><ul className="space-y-3">{logs.slice(0, 5).map((l) => <li key={l.id} className="flex gap-3 items-start"><Avatar name={l.user} size={34} /><div className="flex-1 text-sm"><b>{l.user}</b> <span className="text-muted">{l.aksi}</span><div className="text-xs text-muted">{l.waktu}</div></div></li>)}</ul></Card>
        <Card><CardTitle icon={<AlertTriangle size={20} className="text-warn" />}>Peringatan Data</CardTitle><ul className="space-y-3">{warn.map(([t, to, a]) => <li key={t} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5"><AlertTriangle size={18} className="text-amber-600 shrink-0" /><span className="flex-1 text-sm font-semibold">{t}</span><Link to={to} className="text-sm font-bold text-accent hover:underline whitespace-nowrap">{a}</Link></li>)}</ul></Card></div></div>
  )
}
