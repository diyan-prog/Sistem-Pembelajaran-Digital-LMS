import { useEffect, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Badge, Btn, Card, DataTable, Input, Modal, PageHeader, Select, StatusBadge, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { adminCreate, adminDelete, adminList, adminUpdate, fetchPengaturanGo, setPengaturanGo, type PengaturanGo } from '@/services/api-go'

interface TahunAjaranGo { id: string; nama: string; semester: string; is_active: boolean | null; created_at: string | null }
interface Agenda { tgl: string; akhir: string; judul: string; jenis: string }

const AGENDA_KEY = 'kalender_akademik'

export function TahunAjaran() {
  const { toast, confirm } = useApp()
  const [rows, setRows] = useState<TahunAjaranGo[]>([])
  const [ev, setEv] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'ta' | 'ev' | null>(null)
  const [f, setF] = useState({ nama: '', semester: 'Ganjil' })
  const [e, setE] = useState<Record<string, string>>({})
  const [fe, setFe] = useState({ judul: '', tgl: '', jenis: 'Kegiatan' })

  const load = async () => {
    setLoading(true)
    try {
      const [ta, pengaturan] = await Promise.all([adminList<TahunAjaranGo>('tahun_ajaran'), fetchPengaturanGo()])
      setRows(ta || [])
      const agenda = pengaturan.find((p: PengaturanGo) => p.key === AGENDA_KEY)?.value
      setEv(Array.isArray(agenda) ? agenda as Agenda[] : [])
    } catch (err: any) {
      toast(err.message, 'err')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addTa = async () => {
    const x: Record<string, string> = {}
    if (!/^\d{4}\/\d{4}$/.test(f.nama)) x.nama = 'Format tahun ajaran: 2027/2028'
    setE(x)
    if (Object.keys(x).length) return
    try {
      const created = await adminCreate<TahunAjaranGo>('tahun_ajaran', { nama: f.nama, semester: f.semester, is_active: false })
      setRows([...rows, created])
      setModal(null)
      toast('Tahun ajaran berhasil ditambahkan')
    } catch (err: any) { toast(err.message, 'err') }
  }

  const activate = (r: TahunAjaranGo) => confirm({
    title: 'Jadikan Tahun Ajaran Aktif?',
    message: `${r.nama} semester ${r.semester} akan menjadi periode aktif seluruh sistem.`,
    okLabel: 'Ya, Aktifkan',
    onOk: async () => {
      try {
        await Promise.all(rows.map((x) => adminUpdate('tahun_ajaran', x.id, { nama: x.nama, semester: x.semester, is_active: x.id === r.id })))
        setRows(rows.map((x) => ({ ...x, is_active: x.id === r.id })))
        toast('Tahun ajaran aktif diperbarui')
      } catch (err: any) { toast(err.message, 'err') }
    },
  })

  const removeTa = (r: TahunAjaranGo) => confirm({
    title: 'Hapus Tahun Ajaran?', message: 'Data tahun ajaran akan dihapus.', danger: true,
    onOk: async () => {
      try {
        await adminDelete('tahun_ajaran', r.id)
        setRows(rows.filter((x) => x.id !== r.id))
        toast('Tahun ajaran dihapus')
      } catch (err: any) { toast(err.message, 'err') }
    },
  })

  const saveAgenda = async () => {
    if (!fe.judul.trim() || !fe.tgl) return toast('Judul dan tanggal wajib diisi', 'err')
    const next = [...ev, { tgl: fe.tgl, akhir: fe.tgl, judul: fe.judul, jenis: fe.jenis }].sort((a, b) => a.tgl.localeCompare(b.tgl))
    try {
      await setPengaturanGo(AGENDA_KEY, next)
      setEv(next)
      setModal(null)
      setFe({ judul: '', tgl: '', jenis: 'Kegiatan' })
      toast('Agenda berhasil ditambahkan')
    } catch (err: any) { toast(err.message, 'err') }
  }

  const removeAgenda = (i: number) => confirm({
    title: 'Hapus Agenda?', message: `"${ev[i].judul}" akan dihapus dari kalender.`, danger: true,
    onOk: async () => {
      const next = ev.filter((_, j) => j !== i)
      try {
        await setPengaturanGo(AGENDA_KEY, next)
        setEv(next)
        toast('Agenda dihapus')
      } catch (err: any) { toast(err.message, 'err') }
    },
  })

  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tahun Ajaran' })} title="Tahun Ajaran" subtitle="Kelola tahun ajaran, semester aktif, dan kalender akademik" actions={<Btn icon={<Plus size={18} />} onClick={() => { setF({ nama: '', semester: 'Ganjil' }); setE({}); setModal('ta') }}>Tambah Tahun Ajaran</Btn>} />
      <DataTable rows={rows} loading={loading} cols={[{ key: 'nama', header: 'Tahun Ajaran', render: (r: any) => <b>{r.nama}</b> }, { key: 'semester', header: 'Semester' }, { key: 'created_at', header: 'Dibuat', render: (r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-' }, { key: 'is_active', header: 'Status', render: (r: any) => <StatusBadge s={r.is_active ? 'Aktif' : 'Nonaktif'} /> }]} actions={(r: any) => [...(!r.is_active ? [{ l: 'Jadikan Aktif', icon: <Check size={16} />, onClick: () => activate(r) }] : []), { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => removeTa(r) }]} />
      <div className="flex items-center justify-between mt-8 mb-3"><h2 className="text-[22px] font-bold">Kalender Akademik</h2><Btn variant="outline" icon={<Plus size={18} />} onClick={() => setModal('ev')}>Tambah Agenda</Btn></div>
      <Card pad={false} className="divide-y divide-line overflow-hidden">{ev.map((k, i) => <div key={i} className="flex items-center gap-4 p-4"><div className="w-14 text-center bg-primary-light rounded-xl py-1.5"><div className="text-xs font-bold text-primary-dark">{new Date(k.tgl).toLocaleDateString('id-ID', { month: 'short' })}</div><div className="text-xl font-extrabold">{new Date(k.tgl).getDate()}</div></div><div className="flex-1"><b>{k.judul}</b></div><Badge tone={k.jenis === 'Libur' ? 'red' : k.jenis === 'Kegiatan' ? 'blue' : 'amber'}>{k.jenis}</Badge><Btn variant="ghost" className="!px-2" aria-label="Hapus agenda" onClick={() => removeAgenda(i)}><Trash2 size={17} className="text-danger" /></Btn></div>)}</Card>
      <Modal open={modal === 'ta'} onClose={() => setModal(null)} title="Tambah Tahun Ajaran" footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn onClick={addTa}>Simpan</Btn></>}><Input label="Tahun Ajaran" placeholder="2027/2028" value={f.nama} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><Select label="Semester" value={f.semester} onChange={(x) => setF({ ...f, semester: x.target.value })} options={['Ganjil', 'Genap']} /></Modal>
      <Modal open={modal === 'ev'} onClose={() => setModal(null)} title="Tambah Agenda Akademik" footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn onClick={saveAgenda}>Simpan</Btn></>}><Input label="Judul Agenda" value={fe.judul} onChange={(x) => setFe({ ...fe, judul: x.target.value })} /><Input label="Tanggal" type="date" value={fe.tgl} onChange={(x) => setFe({ ...fe, tgl: x.target.value })} /><Select label="Jenis" value={fe.jenis} onChange={(x) => setFe({ ...fe, jenis: x.target.value })} options={['UTS', 'UAS', 'Libur', 'Kegiatan']} /></Modal></div>
  )
}
