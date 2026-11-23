import { useParams } from 'react-router-dom'
import { ArrowLeft, Check, ClipboardCheck, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Btn, Card, CardTitle, DataTable, NameCell, PageHeader, Progress, Stat, StatusBadge, useCrumbs } from '@/components/ui'
import { kuisById, kuisSoal, offeringById, offeringTitle, studentsOf } from '@/data'

export function KuisHasilGuru() {
  const { id } = useParams(); const k = kuisById(id!); const o = offeringById(k.off); const ss = studentsOf(o.kelasId)
  const rows = ss.map((s, i) => ({ id: s.id, s, skor: i < k.dikerjakan ? Math.min(100, Math.max(30, (Math.round((s.rata + ((i * 7) % 21) - 10) / 10)) * 10)) : null, waktu: i < k.dikerjakan ? `${8 + ((i * 3) % 12)} menit` : '-' }))
  const done = rows.filter((r) => r.skor !== null); const sk = done.map((r) => r.skor!); const avg = sk.length ? Math.round(sk.reduce((a, b) => a + b, 0) / sk.length) : 0
  const dist = ['<50', '50-59', '60-69', '70-79', '80-89', '90-100'].map((r, i) => ({ r, v: sk.filter((x) => (i === 0 ? x < 50 : i === 5 ? x >= 90 : x >= 50 + i * 10 - 10 && x < 60 + i * 10 - 10)).length }))
  const butir = kuisSoal.map((q, i) => { const p = Math.max(25, Math.min(96, 92 - i * 7 + ((i * 11) % 13))); return { no: i + 1, q: q.q, p, lvl: p >= 75 ? 'Mudah' : p >= 50 ? 'Sedang' : 'Sulit' } })
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Daftar Kuis', to: '/guru/kuis' }, { l: 'Hasil Kuis' })} title={`Hasil: ${k.judul}`} subtitle={offeringTitle(o)} actions={<Btn variant="outline" to="/guru/kuis" icon={<ArrowLeft size={18} />}>Kembali</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6"><Stat icon={<ClipboardCheck />} label="Sudah Mengerjakan" value={`${done.length}/25`} /><Stat icon={<Check />} label="Rata-rata Skor" value={avg} tone="blue" /><Stat icon={<Check />} label="Skor Tertinggi" value={sk.length ? Math.max(...sk) : '-'} /><Stat icon={<X />} label="Skor Terendah" value={sk.length ? Math.min(...sk) : '-'} tone="amber" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Distribusi Skor</CardTitle><div style={{ height: 260 }}><ResponsiveContainer><BarChart data={dist}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="r" tickLine={false} axisLine={false} fontSize={12} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[10, 10, 0, 0]}>{dist.map((_, i) => <Cell key={i} fill={i % 2 ? '#2563EB' : '#0B3D5F'} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Analisis Butir Soal</CardTitle><ul className="space-y-3 max-h-[270px] overflow-auto pr-1">{butir.map((b) => <li key={b.no} className="flex items-center gap-3 text-sm"><b className="w-7">{b.no}</b><span className="flex-1 truncate">{b.q}</span><span className="w-24"><Progress value={b.p} tone={b.p >= 75 ? 'green' : b.p >= 50 ? 'amber' : 'red'} /></span><span className="w-10 text-right font-bold">{b.p}%</span><Badge tone={b.lvl === 'Mudah' ? 'green' : b.lvl === 'Sedang' ? 'amber' : 'red'}>{b.lvl}</Badge></li>)}</ul></Card></div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.s.nama} searchPlaceholder="Cari nama siswa" cols={[{ key: 's', header: 'Siswa', sort: (r) => r.s.nama, render: (r) => <NameCell name={r.s.nama} sub={`NIS ${r.s.nis}`} /> }, { key: 'skor', header: 'Skor', sort: (r) => r.skor ?? -1, render: (r) => <b>{r.skor ?? '-'}</b> }, { key: 'waktu', header: 'Durasi' }, { key: 'st', header: 'Status', render: (r) => <StatusBadge s={r.skor === null ? 'Belum Dikumpulkan' : 'Selesai'} /> }]} /></div>
  )
}
