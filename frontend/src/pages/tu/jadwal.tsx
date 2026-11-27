import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, GripVertical, Plus, Save, Trash2 } from 'lucide-react'
import { Btn, Card, Input, Modal, PageHeader, Select, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { adminCreate, adminDelete, adminList, adminUpdate } from '@/services/api-go'

const HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
// Slot jam sesuai data nyata: 5 jam pelajaran (istirahat 10:20-10:40).
const SL = [
  ['07:00', '08:40'],
  ['08:40', '10:20'],
  ['10:40', '12:20'],
  ['12:40', '14:20'],
  ['14:20', '16:00'],
]
// API mengirim `07:00:00`; entri form memakai `07:00`. Terima keduanya.
const jamOf = (jam: string) => { const [h, m] = (jam || '00:00').split(/[:.]/).map(Number); return (h || 0) * 60 + (m || 0) }
// Petakan jam mulai ke indeks slot terdekat, supaya jadwal di luar daftar
// (mis. 10:20-12:00 dari seeder) tetap tampil di kolom yang masuk akal.
const slotIdx = (m: string) => {
  const t = jamOf(m)
  let best = 0
  let dist = Infinity
  SL.forEach((s, i) => {
    const d = Math.abs(t - jamOf(s[0]))
    if (d < dist) { dist = d; best = i }
  })
  return best
}

// API mengirim `07:00:00`; nilai <select> memakai `07:00`.
const hhmm = (t: string | null | undefined) => (t || '').slice(0, 5)

// HARI[1] = 'Senin' ... HARI[6] = 'Sabtu'. Kolom grid memakai indeks HARI ini.
const dayIdx = (name: string) => HARI.indexOf(name)
const cellKey = (hari: string, jamMulai: string) => `${dayIdx(hari)}-${slotIdx(jamMulai)}`

interface JadwalGo { id: string; hari: string; jam_mulai: string; jam_selesai: string; penugasan_id: string; ruangan: string | null }
interface PengampuGo { id_pengampu: string; id_guru: string; id_kelas: string; id_mapel: string; tahun_ajaran: string | null }

type FormState = { penugasan_id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string }
const EMPTY: FormState = { penugasan_id: '', hari: 'Senin', jam_mulai: SL[0][0], jam_selesai: SL[0][1], ruangan: '' }

export function JadwalEditor() {
  const { toast, confirm } = useApp()
  const [kid, setKid] = useState('')
  const [kelas, setKelas] = useState<any[]>([])
  const [pengampu, setPengampu] = useState<PengampuGo[]>([])
  const [mapel, setMapel] = useState<any[]>([])
  const [guru, setGuru] = useState<any[]>([])
  const [jadwal, setJadwal] = useState<JadwalGo[]>([])
  const [warn, setWarn] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [busy, setBusy] = useState(false)
  const drag = useRef<{ id: string } | null>(null)

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
    }).catch((e: any) => toast(e.message, 'err')).finally(() => setLoading(false))
  }, [])

  const offerings = pengampu.filter((o) => o.id_kelas === kid)

  const grid = (() => {
    const m: Record<string, string[]> = {}
    jadwal.filter((j) => offerings.some((o) => o.id_pengampu === j.penugasan_id)).forEach((j) => {
      const key = cellKey(j.hari, j.jam_mulai)
      m[key] = [...(m[key] ?? []), j.id]
    })
    return m
  })()

  // Bentrok guru: guru pengampu blok ini sudah punya jadwal lain (kelas mana pun)
  // pada slot yang sama.
  const teacherBusy = (jadwalId: string, cell: string) => {
    const row = jadwal.find((j) => j.id === jadwalId)
    if (!row) return false
    const guruId = pengampu.find((p) => p.id_pengampu === row.penugasan_id)?.id_guru
    if (!guruId) return false
    const mengajar = new Set(pengampu.filter((p) => p.id_guru === guruId).map((p) => p.id_pengampu))
    return jadwal.some((j) => j.id !== jadwalId && mengajar.has(j.penugasan_id) && cellKey(j.hari, j.jam_mulai) === cell)
  }

  const conflictOf = (jadwalId: string, cell: string) =>
    teacherBusy(jadwalId, cell) ? 'Bentrok: guru pengampu sudah mengajar di kelas lain pada jam ini.' : null

  const saveBlock = async (jadwalId: string, cell: string) => {
    const [d, s] = cell.split('-').map(Number)
    const row = jadwal.find((j) => j.id === jadwalId)
    if (!row) return
    const payload = { hari: HARI[d], jam_mulai: SL[s][0], jam_selesai: SL[s][1], penugasan_id: row.penugasan_id, ruangan: row.ruangan ?? '' }
    const updated = await adminUpdate<JadwalGo>('jadwal', jadwalId, payload)
    setJadwal((prev) => prev.map((j) => (j.id === jadwalId ? { ...j, ...updated, hari: payload.hari, jam_mulai: payload.jam_mulai, jam_selesai: payload.jam_selesai } : j)))
  }

  const move = async (to: string) => {
    const id = drag.current?.id
    drag.current = null
    if (!id) return
    const row = jadwal.find((j) => j.id === id)
    if (!row || cellKey(row.hari, row.jam_mulai) === to) return
    const bt = conflictOf(id, to)
    if (bt) { setWarn(bt); toast(bt, 'warn'); return }
    const [d, s] = to.split('-').map(Number)
    setWarn(null)
    setJadwal((prev) => prev.map((j) => (j.id === id ? { ...j, hari: HARI[d], jam_mulai: SL[s][0], jam_selesai: SL[s][1] } : j)))
    try { await saveBlock(id, to); toast('Jadwal dipindahkan', 'info') }
    catch (err: any) { toast(err.message, 'err') }
  }

  const openAdd = (cell?: string) => {
    let next: FormState = { ...EMPTY, penugasan_id: offerings[0]?.id_pengampu ?? '' }
    if (cell) {
      const [d, s] = cell.split('-').map(Number)
      next = { ...next, hari: HARI[d], jam_mulai: SL[s][0], jam_selesai: SL[s][1] }
    }
    setEditId(null)
    setForm(next)
    setOpen(true)
  }
  const openEdit = (jadwalId: string) => {
    const row = jadwal.find((j) => j.id === jadwalId)
    if (!row) return
    setEditId(jadwalId)
    setForm({ penugasan_id: row.penugasan_id, hari: row.hari, jam_mulai: hhmm(row.jam_mulai), jam_selesai: hhmm(row.jam_selesai), ruangan: row.ruangan ?? '' })
    setOpen(true)
  }

  const submit = async () => {
    if (!form.penugasan_id) { toast('Pilih penugasan (guru + mapel) terlebih dahulu', 'err'); return }
    const target = cellKey(form.hari, form.jam_mulai)
    const dup = jadwal.find((j) => j.id !== editId && cellKey(j.hari, j.jam_mulai) === target &&
      offerings.some((o) => o.id_pengampu === j.penugasan_id && o.id_pengampu === form.penugasan_id))
    if (dup) { toast('Mata pelajaran ini sudah terjadwal pada hari dan jam tersebut', 'warn'); return }
    const guruId = pengampu.find((p) => p.id_pengampu === form.penugasan_id)?.id_guru
    const bentrok = jadwal.find((j) => j.id !== editId && cellKey(j.hari, j.jam_mulai) === target &&
      pengampu.some((p) => p.id_pengampu === j.penugasan_id && p.id_guru === guruId))
    if (bentrok) { toast('Guru pengampu sudah mengajar pada hari dan jam tersebut', 'warn'); return }
    const payload = { hari: form.hari, jam_mulai: form.jam_mulai, jam_selesai: form.jam_selesai, penugasan_id: form.penugasan_id, ruangan: form.ruangan }
    setBusy(true)
    try {
      if (editId) {
        await adminUpdate<JadwalGo>('jadwal', editId, payload)
        setJadwal((prev) => prev.map((j) => (j.id === editId ? { ...j, ...payload } : j)))
        toast('Jadwal berhasil diperbarui', 'info')
      } else {
        const created = await adminCreate<JadwalGo>('jadwal', payload)
        setJadwal((prev) => [...prev, { ...created, ...payload }])
        toast('Jadwal berhasil ditambahkan', 'info')
      }
      setOpen(false); setEditId(null); setForm(EMPTY)
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) }
  }

  const remove = (jadwalId: string) => confirm({
    title: 'Hapus Jadwal?', message: 'Blok jadwal ini akan dihapus dari tabel mengajar.', danger: true,
    onOk: async () => {
      try {
        await adminDelete('jadwal', jadwalId)
        setJadwal((prev) => prev.filter((j) => j.id !== jadwalId))
        toast('Jadwal berhasil dihapus')
      } catch (err: any) { toast(err.message, 'err') }
    },
  })

  const subOf = (o: PengampuGo) => mapel.find((m) => m.id === o.id_mapel)
  const guruOf = (o: PengampuGo) => guru.find((x) => x.profile_id === o.id_guru)?.nama || '-'
  const label = (o: PengampuGo) => `${subOf(o)?.name || 'Mapel'} (${guruOf(o)})`

  return (
    <div>
      <PageHeader
        crumbs={useCrumbs({ l: 'Jadwal Pelajaran' })}
        title="Jadwal Pelajaran"
        subtitle="Editor jadwal mingguan per kelas. Seret blok ke slot lain, atau tambah/edit/hapus lewat tombol."
        actions={<>
          <Select aria-label="Kelas" value={kid} onChange={(e) => { setKid(e.target.value); setWarn(null) }} options={kelas.map((k) => ({ v: k.id, l: k.name }))} className="!w-44" />
          <Btn icon={<Plus size={18} />} onClick={() => openAdd()} disabled={!kid || !offerings.length}>Tambah Jadwal</Btn>
        </>}
      />
      {loading && <p className="text-muted mb-4">Memuat jadwal...</p>}
      {!loading && !offerings.length && <p className="text-muted mb-4">Belum ada penugasan mengajar untuk kelas ini. Tambah di halaman Pengampu Mapel.</p>}
      {warn && <div role="alert" className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-5 text-sm"><AlertTriangle size={18} />{warn}</div>}

      <Card className="overflow-x-auto" pad={false}>
        <div className="min-w-[900px] p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: '110px repeat(6, 1fr)' }}>
            <div />
            {[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className="text-center font-bold text-sm py-2">{HARI[d]}</div>)}
            {SL.map((s, si) => [
              <div key={'t' + si} className="text-xs text-muted font-semibold flex items-center">{s[0]} - {s[1]}</div>,
              ...[1, 2, 3, 4, 5, 6].map((d) => {
                const key = `${d}-${si}`
                const items = grid[key] ?? []
                const bad = items.length > 1 || items.some((id) => teacherBusy(id, key))
                return (
                  <div
                    key={key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => move(key)}
                    onDoubleClick={() => { if (!items.length) openAdd(key) }}
                    className={cn('min-h-20 rounded-xl border-2 border-dashed p-1.5 space-y-1.5', bad ? 'border-danger bg-red-50' : items.length ? 'border-transparent bg-gray-50' : 'border-line')}
                  >
                    {items.map((id) => {
                      const row = jadwal.find((j) => j.id === id)
                      const o = row ? offerings.find((x) => x.id_pengampu === row.penugasan_id) : undefined
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={() => (drag.current = { id })}
                          className="group relative rounded-lg px-2 py-1.5 pr-7 text-white text-xs cursor-grab active:cursor-grabbing shadow-soft"
                          style={{ background: '#0B3D5F' }}
                        >
                          <button type="button" onClick={() => openEdit(id)} className="flex items-center gap-1 font-bold text-left w-full">
                            <GripVertical size={12} />{o ? subOf(o)?.name || 'Mapel' : 'Mapel'}
                          </button>
                          <div className="opacity-90 truncate">{o ? guruOf(o) : '-'}</div>
                          <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100">
                            <button type="button" onClick={() => openEdit(id)} aria-label="Edit jadwal" className="p-1 rounded hover:bg-white/20"><Save size={11} /></button>
                            <button type="button" onClick={() => remove(id)} aria-label="Hapus jadwal" className="p-1 rounded hover:bg-red-500"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }),
            ])}
          </div>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditId(null) }}
        wide
        title={editId ? 'Edit Jadwal' : 'Tambah Jadwal'}
        footer={<><Btn variant="outline" onClick={() => { setOpen(false); setEditId(null) }}>Batal</Btn><Btn loading={busy} icon={<Save size={16} />} onClick={submit}>Simpan</Btn></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Mata Pelajaran / Guru"
            value={form.penugasan_id}
            onChange={(e) => setForm({ ...form, penugasan_id: e.target.value })}
            options={offerings.map((o) => ({ v: o.id_pengampu, l: label(o) }))}
          />
          <Select
            label="Hari"
            value={form.hari}
            onChange={(e) => setForm({ ...form, hari: e.target.value })}
            options={HARI.slice(1).map((h) => ({ v: h, l: h }))}
          />
          <Select
            label="Jam Mulai"
            value={form.jam_mulai}
            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
            options={SL.map((s) => ({ v: s[0], l: s[0] }))}
          />
          <Select
            label="Jam Selesai"
            value={form.jam_selesai}
            onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
            options={SL.map((s) => ({ v: s[1], l: s[1] }))}
          />
          <Input
            label="Ruangan"
            value={form.ruangan}
            onChange={(e) => setForm({ ...form, ruangan: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  )
}
