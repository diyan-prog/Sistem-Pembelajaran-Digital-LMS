import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, GripVertical, Save } from 'lucide-react'
import { Btn, Card, PageHeader, Select, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { adminCreate, adminList, adminUpdate } from '@/services/api-go'

const HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const SL = [['07.00', '08.40'], ['08.40', '10.20'], ['10.20', '12.00'], ['12.40', '14.20']]
const jamOf = (jam: string) => { const [h, m] = (jam || '00.00').split('.').map(Number); return h * 60 + (m || 0) }
const slotIdx = (m: string) => (jamOf(m) < 520 ? 0 : jamOf(m) < 620 ? 1 : jamOf(m) < 740 ? 2 : 3)

interface JadwalGo { id: string; hari: string; jam_mulai: string; jam_selesai: string; penugasan_id: string; ruangan: string | null }
interface PengampuGo { id_pengampu: string; id_guru: string; id_kelas: string; id_mapel: string; tahun_ajaran: string | null }

export function JadwalEditor() {
  const { toast } = useApp()
  const [kid, setKid] = useState('')
  const [kelas, setKelas] = useState<any[]>([])
  const [pengampu, setPengampu] = useState<PengampuGo[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [guru, setGuru] = useState<any[]>([])
  const [jadwal, setJadwal] = useState<JadwalGo[]>([])
  const [grid, setGrid] = useState<Record<string, Record<string, string[]>>>({})
  const drag = useRef<{ id: string; from: string } | null>(null)
  const [warn, setWarn] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminList<any>('classes'), adminList<PengampuGo>('pengampu'),
      adminList<any>('mapel'), adminList<any>('guru'), adminList<JadwalGo>('jadwal'),
    ]).then(([k, p, m, g, j]) => {
      setKelas(k || [])
      setPengampu(p || [])
      setMapel(m || [])
      setGuru(g || [])
      setJadwal(j || [])
      if (k?.length) setKid(k[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const offerings = pengampu.filter((o) => o.id_kelas === kid)
  const current = grid[kid] ?? (() => {
    const m: Record<string, string[]> = {}
    jadwal.filter((j) => offerings.some((o) => o.id_pengampu === j.penugasan_id)).forEach((j) => {
      const key = `${j.hari}-${slotIdx(j.jam_mulai)}`
      m[key] = [...(m[key] ?? []), j.penugasan_id]
    })
    return m
  })()

  const teacherBusy = (oid: string, cell: string) => {
    const o = offerings.find((x) => x.id_pengampu === oid)
    if (!o) return false
    return pengampu.some((x) => x.id_pengampu !== oid && x.id_guru === o.id_guru &&
      jadwal.some((j) => j.penugasan_id === x.id_pengampu && `${j.hari}-${slotIdx(j.jam_mulai)}` === cell))
  }

  const persist = async (oid: string, cell: string) => {
    const [hari, slot] = cell.split('-')
    const payload = {
      hari: Number(hari), jam_mulai: SL[Number(slot)][0], jam_selesai: SL[Number(slot)][1],
      penugasan_id: oid, ruangan: '',
    }
    const existing = jadwal.find((j) => j.penugasan_id === oid)
    if (existing) {
      const updated = await adminUpdate<JadwalGo>('jadwal', existing.id, payload)
      setJadwal(jadwal.map((j) => (j.id === existing.id ? updated : j)))
    } else {
      const created = await adminCreate<JadwalGo>('jadwal', payload)
      setJadwal([...jadwal, created])
    }
  }

  const move = async (to: string) => {
    const d = drag.current
    if (!d || d.from === to) return
    const ng = { ...current, [d.from]: (current[d.from] ?? []).filter((x) => x !== d.id), [to]: [...(current[to] ?? []), d.id] }
    setGrid({ ...grid, [kid]: ng })
    const bt = teacherBusy(d.id, to) ? 'Bentrok: guru pengampu sudah mengajar di kelas lain pada jam ini.' : (ng[to].length > 1 ? 'Bentrok: dua mata pelajaran pada jam yang sama di kelas ini.' : null)
    setWarn(bt)
    if (bt) toast(bt, 'warn')
    else {
      try { await persist(d.id, to); toast('Jadwal dipindahkan', 'info') }
      catch (err: any) { toast(err.message, 'err') }
    }
    drag.current = null
  }

  const subOf = (o: PengampuGo) => mapel.find((m) => m.id === o.id_mapel)
  const guruOf = (o: PengampuGo) => {
    const g = guru.find((x) => x.profile_id === o.id_guru)
    return g?.nama || '-'
  }

  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Jadwal Pelajaran' })} title="Jadwal Pelajaran" subtitle="Editor jadwal mingguan per kelas. Seret blok mata pelajaran ke slot lain." actions={<><Select aria-label="Kelas" value={kid} onChange={(e) => { setKid(e.target.value); setWarn(null) }} options={kelas.map((k) => ({ v: k.id, l: k.name }))} className="!w-40" /><Btn icon={<Save size={18} />} onClick={() => toast('Jadwal tersimpan otomatis', 'info')}>Simpan Jadwal</Btn></>} />
      {loading && <p className="text-muted mb-4">Memuat jadwal...</p>}
      {warn && <div role="alert" className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-5 text-sm"><AlertTriangle size={18} />{warn}</div>}
      <Card className="overflow-x-auto"><div className="min-w-[900px]"><div className="grid gap-2" style={{ gridTemplateColumns: '110px repeat(6, 1fr)' }}><div />{[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className="text-center font-bold text-sm py-2">{HARI[d]}</div>)}
        {SL.map((s, si) => [<div key={'t' + si} className="text-xs text-muted font-semibold flex items-center">{s[0]} - {s[1]}</div>, ...[1, 2, 3, 4, 5, 6].map((d) => { const key = `${d}-${si}`; const items = current[key] ?? []; const bad = items.length > 1 || items.some((i) => teacherBusy(i, key))
          return <div key={key} onDragOver={(e) => e.preventDefault()} onDrop={() => move(key)} className={cn('min-h-20 rounded-xl border-2 border-dashed p-1.5 space-y-1.5', bad ? 'border-danger bg-red-50' : items.length ? 'border-transparent bg-gray-50' : 'border-line')}>{items.map((i) => { const o = offerings.find((x) => x.id_pengampu === i); const sub = o ? subOf(o) : null; return <div key={i} draggable onDragStart={() => (drag.current = { id: i, from: key })} className="rounded-lg px-2 py-1.5 text-white text-xs cursor-grab active:cursor-grabbing shadow-soft" style={{ background: '#0B3D5F' }}><div className="flex items-center gap-1 font-bold"><GripVertical size={12} />{sub?.name || 'Mapel'}</div><div className="opacity-90">{o ? guruOf(o) : '-'}</div></div> })}</div> })])}</div></div></Card></div>
  )
}
