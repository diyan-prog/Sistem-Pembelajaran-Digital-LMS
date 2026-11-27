import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, FileSpreadsheet, X } from 'lucide-react'
import { Badge, Btn, Card, DataTable, NameCell, PageHeader, Stat, cn, download, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { nilaiKelas, offeringById, offeringTitle, subjectById } from '@/lib/data'
import { mine } from './common'

export function RekapNilaiKelas() {
  const { offId } = useParams(); const o = offeringById(offId!); const { toast } = useApp(); const rows = nilaiKelas(o.kelasId, o.id)
  const rata = rows.length ? Math.round(rows.reduce((a, r) => a + r.akhir, 0) / rows.length) : 0
  const tertinggi = rows.length ? Math.max(...rows.map((r) => r.akhir)) : 0
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: '/guru/kelas' }, { l: subjectById(o.subjectId).nama, to: `/guru/kelas/${offId}` }, { l: 'Rekap Nilai' })} title="Rekap Nilai Kelas" subtitle={offeringTitle(o)} actions={<Btn icon={<FileSpreadsheet size={18} />} onClick={() => { download(`rekap-nilai-${o.kode}.csv`); toast('Berkas Excel berhasil diekspor') }}>Ekspor Excel</Btn>} />
      <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Check />} label="Rata-rata Nilai Akhir" value={rata} /><Stat icon={<Check />} label="Nilai Tertinggi" value={tertinggi} tone="blue" /><Stat icon={<X />} label="Di Bawah KKM (75)" value={rows.filter((r) => r.akhir < 75).length} tone="red" /></div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.siswa.nama} searchPlaceholder="Cari nama siswa" cols={[{ key: 's', header: 'Siswa', sort: (r) => r.siswa.nama, render: (r) => <NameCell name={r.siswa.nama} sub={`NIS ${r.siswa.nis}`} /> }, { key: 'tugas', header: 'Tugas (30%)', sort: (r) => r.tugas }, { key: 'kuis', header: 'Kuis (20%)', sort: (r) => r.kuis }, { key: 'uts', header: 'UTS (30%)', sort: (r) => r.uts }, { key: 'uas', header: 'UAS (20%)', sort: (r) => r.uas }, { key: 'akhir', header: 'Nilai Akhir', sort: (r) => r.akhir, render: (r) => <b className={cn(r.akhir < 75 && 'text-danger')}>{r.akhir}</b> }, { key: 'k', header: 'Keterangan', render: (r) => <Badge tone={r.akhir >= 75 ? 'green' : 'red'}>{r.akhir >= 75 ? 'Tuntas' : 'Remedial'}</Badge> }]} /></div>
  )
}
export function RekapNilaiPick() {
  const offs = mine()

  return <div><PageHeader crumbs={useCrumbs({ l: 'Rekap Nilai' })} title="Rekap Nilai Kelas" subtitle="Pilih kelas" /><div className="grid md:grid-cols-2 gap-5">{offs.map((o) => <Link key={o.id} to={`/guru/rekap-nilai/${o.id}`}><Card hover><b className="uppercase">{offeringTitle(o)}</b><div className="text-sm text-muted mt-1">Rata-rata nilai {o.rata}</div></Card></Link>)}</div></div>
}
