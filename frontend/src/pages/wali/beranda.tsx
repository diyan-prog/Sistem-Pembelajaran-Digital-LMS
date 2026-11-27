import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Award, CalendarCheck, Users } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Card, CardTitle, Chips, DataTable, NameCell, PageHeader, Stat, StatusBadge, cn } from '@/components/ui'
import { bulanHadir, distribusiNilai, jurusanNama } from '@/lib/data'
import { statusOf, useWaliData } from './common'

export function WaliBeranda() {
  const nav = useNavigate(); const { siswa: ss, kelasInfo, loading } = useWaliData(); const [f, setF] = useState('Semua')

  const avgH = ss.length ? Math.round(ss.reduce((a, s) => a + s.hadir, 0) / ss.length) : 0
  const avgN = ss.length ? Math.round(ss.reduce((a, s) => a + s.rata, 0) / ss.length) : 0
  const risk = ss.filter((s) => s.risiko).length
  const rows = ss.filter((s) => f === 'Semua' || statusOf(s) === f)

  if (loading) return <div className="p-8 text-center text-muted">Memuat data wali kelas...</div>;

  const kelasNama = kelasInfo?.nama || '-';
  const jurusan = jurusanNama(kelasInfo?.jurusan ?? '') || '-';
  
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda' }]} title={`Wali Kelas ${kelasNama}`} subtitle={`${jurusan} • Mode hanya-lihat`} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={ss.length} sub="Aktif semua" /><Stat icon={<CalendarCheck />} label="Rata-rata Kehadiran" value={`${avgH}%`} tone="blue" /><Stat icon={<Award />} label="Rata-rata Nilai" value={avgN} /><Stat icon={<AlertTriangle />} label="Siswa Berisiko" value={risk} tone="red" sub="Kehadiran, nilai, atau tugas" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Kehadiran per Bulan</CardTitle><div style={{ height: 250 }}><ResponsiveContainer><AreaChart data={bulanHadir}><defs><linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0B3D5F" stopOpacity={0.35} /><stop offset="100%" stopColor="#0B3D5F" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="b" tickLine={false} axisLine={false} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="v" name="Kehadiran (%)" stroke="#0B3D5F" strokeWidth={3} fill="url(#gh)" /></AreaChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Distribusi Nilai</CardTitle><div style={{ height: 250 }}><ResponsiveContainer><BarChart data={distribusiNilai}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="r" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[10, 10, 0, 0]}>{distribusiNilai.map((_, i) => <Cell key={i} fill={i < 2 ? '#F59E0B' : i % 2 ? '#2563EB' : '#0B3D5F'} />)}</Bar></BarChart></ResponsiveContainer></div></Card></div>
      <h2 className="text-[22px] font-bold mb-3">Daftar Siswa Perwalian</h2>
      <DataTable rows={rows} pageSize={10} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari nama atau NIS" onRow={(s) => nav(`/wali/siswa/${s.id}`)} filters={<Chips value={f} onChange={setF} options={['Semua', 'Aman', 'Waspada', 'Berisiko'].map((k) => ({ k, l: k }))} />}
        cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={`NIS ${s.nis}`} /> }, { key: 'hadir', header: 'Kehadiran', sort: (s) => s.hadir, render: (s) => <span className={cn('font-bold flex items-center gap-1.5', s.hadir < 75 && 'text-danger')}>{s.hadir < 75 && <AlertTriangle size={15} />}{s.hadir}%</span> }, { key: 'rata', header: 'Rata-rata Nilai', sort: (s) => s.rata, render: (s) => <span className={cn('font-bold', s.rata < 70 && 'text-danger')}>{s.rata}</span> }, { key: 'belum', header: 'Tugas Belum Dikumpulkan', sort: (s) => s.belum, render: (s) => <Badge tone={s.belum >= 3 ? 'red' : s.belum ? 'amber' : 'green'}>{s.belum} tugas</Badge> }, { key: 'st', header: 'Status', render: (s) => <StatusBadge s={statusOf(s)} /> }]} /></div>
  )
}
