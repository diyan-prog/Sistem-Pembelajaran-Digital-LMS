import { useRef, useState } from 'react'
import { AlertTriangle, GripVertical, Save } from 'lucide-react'
import { Btn, Card, PageHeader, Select, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { HARI, kelas, offerings, subjectById, teacherById } from '@/mocks'

const tm = (t: string) => { const [h, m] = t.split('.').map(Number); return h * 60 + m }

const SL = [['07.00', '08.40'], ['08.40', '10.20'], ['10.20', '12.00'], ['12.40', '14.20']]
const slotIdx = (m: string) => (tm(m) < 520 ? 0 : tm(m) < 620 ? 1 : tm(m) < 740 ? 2 : 3)
export function JadwalEditor() {
  const { toast } = useApp(); const [kid, setKid] = useState('k2'); const [grid, setGrid] = useState<Record<string, Record<string, string[]>>>({})
  const g = grid[kid] ?? (() => { const m: Record<string, string[]> = {}; offerings.filter((o) => o.kelasId === kid).forEach((o) => o.jadwal.forEach((j) => { const k = `${j.hari}-${slotIdx(j.mulai)}`; m[k] = [...(m[k] ?? []), o.id] })); return m })()
  const drag = useRef<{ id: string; from: string } | null>(null); const [warn, setWarn] = useState<string | null>(null)
  const teacherBusy = (oid: string, cell: string) => { const o = offerings.find((x) => x.id === oid)!; return offerings.some((x) => x.kelasId !== kid && x.guru === o.guru && x.jadwal.some((j) => `${j.hari}-${slotIdx(j.mulai)}` === cell)) }
  const move = (to: string) => { const d = drag.current; if (!d || d.from === to) return; const ng = { ...g, [d.from]: (g[d.from] ?? []).filter((x) => x !== d.id), [to]: [...(g[to] ?? []), d.id] }; setGrid({ ...grid, [kid]: ng }); const bt = teacherBusy(d.id, to) ? 'Bentrok: guru pengampu sudah mengajar di kelas lain pada jam ini.' : (ng[to].length > 1 ? 'Bentrok: dua mata pelajaran pada jam yang sama di kelas ini.' : null); setWarn(bt); if (bt) toast(bt, 'warn'); else toast('Jadwal dipindahkan', 'info'); drag.current = null }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Jadwal Pelajaran' })} title="Jadwal Pelajaran" subtitle="Editor jadwal mingguan per kelas. Seret blok mata pelajaran ke slot lain." actions={<><Select aria-label="Kelas" value={kid} onChange={(e) => { setKid(e.target.value); setWarn(null) }} options={kelas.map((k) => ({ v: k.id, l: k.nama }))} className="!w-40" /><Btn icon={<Save size={18} />} onClick={() => toast('Jadwal berhasil disimpan')}>Simpan Jadwal</Btn></>} />
      {warn && <div role="alert" className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-5 text-sm"><AlertTriangle size={18} />{warn}</div>}
      <Card className="overflow-x-auto"><div className="min-w-[900px]"><div className="grid gap-2" style={{ gridTemplateColumns: '110px repeat(6, 1fr)' }}><div />{[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className="text-center font-bold text-sm py-2">{HARI[d]}</div>)}
        {SL.map((s, si) => [<div key={'t' + si} className="text-xs text-muted font-semibold flex items-center">{s[0]} - {s[1]}</div>, ...[1, 2, 3, 4, 5, 6].map((d) => { const k = `${d}-${si}`; const items = g[k] ?? []; const bad = items.length > 1 || items.some((i) => teacherBusy(i, k))
          return <div key={k} onDragOver={(e) => e.preventDefault()} onDrop={() => move(k)} className={cn('min-h-20 rounded-xl border-2 border-dashed p-1.5 space-y-1.5', bad ? 'border-danger bg-red-50' : items.length ? 'border-transparent bg-gray-50' : 'border-line')}>{items.map((i) => { const o = offerings.find((x) => x.id === i)!; const sub = subjectById(o.subjectId); return <div key={i} draggable onDragStart={() => (drag.current = { id: i, from: k })} className="rounded-lg px-2 py-1.5 text-white text-xs cursor-grab active:cursor-grabbing shadow-soft" style={{ background: sub.warna }}><div className="flex items-center gap-1 font-bold"><GripVertical size={12} />{sub.nama}</div><div className="opacity-90">{teacherById(o.guru).sapaan}</div></div> })}</div> })])}</div></div></Card></div>
  )
}
