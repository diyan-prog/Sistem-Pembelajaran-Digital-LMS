import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Avatar, Btn, Card, PageHeader, Select, cn, download } from '@/components/ui'
import { useApp } from '@/context'
import { kelasById, nilaiSiswa, siswaOfferings, studentsOf, subjectById, useData } from '@/lib/data'
import { waliKelasId } from './common'

export function WaliRekapNilai() {
  useData()
  const kid = waliKelasId(); const kelasNama = kid ? kelasById(kid).nama : '-'
  const [p, setP] = useState('Semester'); const mapel = siswaOfferings(kid); const ss = studentsOf(kid); const [q, setQ] = useState(''); const { toast } = useApp()
  const rows = ss.map((s) => { const nl = nilaiSiswa(s.id); const vals = nl.map((n) => (p === 'UTS' ? n.uts : p === 'Tugas' ? n.tugas : p === 'Kuis' ? n.kuis : n.rata)); return { id: s.id, s, vals, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 } })
  const cell = (v: number) => (v < 70 ? 'bg-red-100 text-red-800' : v >= 90 ? 'bg-green-100 text-green-800' : '')
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Rekap Nilai' }]} title="Rekap Nilai" subtitle={`Matriks nilai siswa per mata pelajaran • ${kelasNama}`} actions={<Btn icon={<Download size={18} />} onClick={() => { download('rekap-nilai-XI-RPL-1.csv'); toast('Rekap nilai diekspor') }}>Ekspor</Btn>} />
      <Card pad={false} className="overflow-hidden"><div className="p-4 flex flex-wrap gap-3 items-center border-b border-line"><input aria-label="Cari siswa" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama siswa" className="h-11 w-72 rounded-xl border border-line px-4 text-sm outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary" /><Select aria-label="Periode" value={p} onChange={(e) => setP(e.target.value)} options={[{ v: 'Semester', l: 'Periode: Rata-rata Semester' }, { v: 'UTS', l: 'Periode: UTS' }, { v: 'Tugas', l: 'Periode: Tugas' }, { v: 'Kuis', l: 'Periode: Kuis' }]} className="w-64" /><span className="ml-auto text-xs text-muted">Merah &lt; 70 ΓÇó Hijau ΓëÑ 90</span></div>
        <div className="overflow-auto max-h-[640px]"><table className="text-sm w-full min-w-[900px]"><thead className="sticky top-0 bg-gray-50 z-10 text-xs uppercase text-muted"><tr><th className="px-4 h-12 text-left sticky left-0 bg-gray-50 min-w-[220px]">Siswa</th>{mapel.map((o) => <th key={o.id} className="px-2 text-center">{subjectById(o.subjectId).nama.split(' ').map((w) => w[0] + w.slice(1, 4)).join(' ')}</th>)}<th className="px-4 text-center">Rata-rata</th></tr></thead>
          <tbody>{rows.filter((r) => r.s.nama.toLowerCase().includes(q.toLowerCase())).map((r) => <tr key={r.id} className="border-t border-line h-12 hover:bg-primary-light/40"><td className="px-4 sticky left-0 bg-white"><Link to={`/wali/siswa/${r.id}`} className="flex items-center gap-2 font-semibold hover:text-primary-dark"><Avatar name={r.s.nama} size={28} />{r.s.nama}</Link></td>{r.vals.map((v, i) => <td key={i} className="text-center"><span className={cn('inline-block min-w-10 py-1 rounded-lg font-semibold', cell(v))}>{v}</span></td>)}<td className="text-center font-extrabold">{r.avg}</td></tr>)}</tbody></table></div></Card></div>
  )
}
