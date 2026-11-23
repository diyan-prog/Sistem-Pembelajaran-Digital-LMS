import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { Badge, Btn, Card, CardTitle, PageHeader, Select, StatusBadge, download } from '@/components/ui'
import { useApp } from '@/context'
import { kelas, kelasStat } from '@/mocks'

export function KepsekLaporan() {
  const { toast } = useApp(); const [j, setJ] = useState('Rekap Kehadiran'); const [p, setP] = useState('Oktober 2026'); const [k, setK] = useState('Semua')
  const ks = kelasStat.filter((x) => k === 'Semua' || x.nama === k)
  const last = [['Rekap Kehadiran September 2026', '30 Sep 2026', 'PDF'], ['Rekap Nilai Tengah Semester', '14 Okt 2026', 'Excel'], ['Keaktifan Guru Triwulan III', '20 Okt 2026', 'PDF']]
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/kepsek/beranda' }, { l: 'Laporan' }]} title="Laporan" subtitle="Pilih jenis laporan, lihat pratinjau, lalu ekspor" actions={<><Btn variant="outline" icon={<FileText size={18} />} onClick={() => { download('laporan.pdf'); toast('Laporan PDF diekspor') }}>Ekspor PDF</Btn><Btn icon={<FileSpreadsheet size={18} />} onClick={() => { download('laporan.csv'); toast('Laporan Excel diekspor') }}>Ekspor Excel</Btn></>} />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start"><div className="space-y-6"><Card className="space-y-4"><CardTitle>Parameter Laporan</CardTitle><Select label="Jenis Laporan" value={j} onChange={(e) => setJ(e.target.value)} options={['Rekap Kehadiran', 'Rekap Nilai', 'Keaktifan Guru', 'Siswa Berisiko']} /><Select label="Periode" value={p} onChange={(e) => setP(e.target.value)} options={['Oktober 2026', 'September 2026', 'Semester Ganjil 2026/2027']} /><Select label="Kelas" value={k} onChange={(e) => setK(e.target.value)} options={['Semua', ...kelas.map((x) => x.nama)]} /></Card>
        <Card><CardTitle>Laporan Terakhir</CardTitle><ul className="space-y-3">{last.map(([a, b, c]) => <li key={a} className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center"><FileText size={18} /></span><div className="flex-1 text-sm"><b className="block leading-snug">{a}</b><span className="text-xs text-muted">{b}</span></div><Badge tone={c === 'PDF' ? 'red' : 'green'}>{c}</Badge></li>)}</ul></Card></div>
        <Card><div className="flex items-center justify-between mb-1"><h3 className="text-lg font-bold">Pratinjau Laporan</h3><Badge tone="blue">Langsung</Badge></div><p className="text-sm text-muted mb-4">{j} ΓÇó {p} ΓÇó {k === 'Semua' ? 'Seluruh kelas' : k}</p>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-muted text-left"><tr><th className="p-3">Kelas</th>{j === 'Keaktifan Guru' ? <><th>Guru Aktif</th><th>Materi</th></> : j === 'Siswa Berisiko' ? <><th>Berisiko</th><th>Persentase</th></> : <><th>Jumlah Siswa</th><th>{j === 'Rekap Nilai' ? 'Rata-rata Nilai' : 'Kehadiran'}</th></>}<th>Status</th></tr></thead>
            <tbody>{ks.map((x) => { const v = j === 'Rekap Nilai' ? x.nilai : x.hadir; return <tr key={x.id} className="border-t border-line h-12"><td className="p-3 font-bold">{x.nama}</td>{j === 'Keaktifan Guru' ? <><td>{8 + x.rank}</td><td>{20 + x.rank * 3}</td></> : j === 'Siswa Berisiko' ? <><td>{x.berisiko}</td><td>{Math.round((x.berisiko / 25) * 100)}%</td></> : <><td>{x.siswa}</td><td className="font-bold">{v}{j === 'Rekap Nilai' ? '' : '%'}</td></>}<td><StatusBadge s={v >= 80 || j === 'Keaktifan Guru' ? 'Aman' : 'Waspada'} /></td></tr> })}</tbody></table></div></Card></div></div>
  )
}
