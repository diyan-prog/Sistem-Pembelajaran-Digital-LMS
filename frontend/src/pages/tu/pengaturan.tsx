import { useEffect, useState } from 'react'
import { Award, Building2, CalendarDays, ClipboardCheck, Save } from 'lucide-react'
import { Btn, Card, CardTitle, Dropzone, Field, Input, PageHeader, Progress, Select, Textarea, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { adminList, fetchPengaturanGo, setPengaturanGo, type PengaturanGo, type TahunAjaranGo } from '@/services/api-go'

type ProfilSekolah = { ta: string; nama: string; npsn: string; alamat: string; telp: string; min: number }
type Bobot = { tugas: number; kuis: number; uts: number; uas: number }
type Jam = [string, string][]

const DEFAULT_PROFIL: ProfilSekolah = { ta: '', nama: 'SMK Negeri 2 Indramayu', npsn: '20213456', alamat: 'Jl. Raya Lohbener, Indramayu, Jawa Barat', telp: '(0234) 272 123', min: 75 }
const DEFAULT_BOBOT: Bobot = { tugas: 30, kuis: 20, uts: 30, uas: 20 }
const DEFAULT_JAM: Jam = [['1', '07.00 - 07.45'], ['2', '07.45 - 08.30'], ['3', '08.30 - 09.15'], ['4', '09.15 - 10.00'], ['5', '10.20 - 11.05'], ['6', '11.05 - 11.50'], ['7', '12.40 - 13.25'], ['8', '13.25 - 14.10']]

export function PengaturanSistem() {
  const { toast } = useApp()
  const [f, setF] = useState<ProfilSekolah>(DEFAULT_PROFIL)
  const [b, setB] = useState<Bobot>(DEFAULT_BOBOT)
  const [jam, setJam] = useState<Jam>(DEFAULT_JAM)
  const [tahunAjaran, setTahunAjaran] = useState<string[]>([])
  const [e, setE] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const tot = b.tugas + b.kuis + b.uts + b.uas

  useEffect(() => {
    Promise.all([fetchPengaturanGo(), adminList<TahunAjaranGo>('tahun_ajaran')])
      .then(([rows, ta]) => {
        const get = (key: string) => rows.find((r: PengaturanGo) => r.key === key)?.value
        const profil = get('profil_sekolah') as Partial<ProfilSekolah> | undefined
        setF({ ...DEFAULT_PROFIL, ...(profil || {}) })
        setB({ ...DEFAULT_BOBOT, ...((get('bobot_nilai') as Partial<Bobot>) || {}) })
        const storedJam = get('jam_pelajaran') as Jam | undefined
        if (Array.isArray(storedJam)) setJam(storedJam)
        setTahunAjaran(ta.map((x: TahunAjaranGo) => `${x.nama} - ${x.semester}`))
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    const x: Record<string, string> = {}
    if (tot !== 100) x.bobot = `Total bobot harus 100% (saat ini ${tot}%)`
    if (f.min < 0 || f.min > 100) x.min = 'Ambang 0 - 100'
    if (!f.nama.trim()) x.nama = 'Nama sekolah wajib diisi'
    setE(x)
    if (Object.keys(x).length) return
    setSaving(true)
    try {
      await Promise.all([
        setPengaturanGo('profil_sekolah', f),
        setPengaturanGo('bobot_nilai', b),
        setPengaturanGo('jam_pelajaran', jam),
      ])
      toast('Pengaturan sistem berhasil disimpan')
    } catch (err: any) { toast(err.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Pengaturan Sistem' })} title="Pengaturan Sistem" subtitle="Konfigurasi tahun ajaran, jam pelajaran, profil sekolah, dan penilaian" actions={<Btn icon={<Save size={18} />} loading={saving} onClick={save}>Simpan Pengaturan</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6"><div className="space-y-6"><Card className="space-y-4"><CardTitle icon={<Building2 size={20} className="text-primary" />}>Profil Sekolah</CardTitle><Input label="Nama Sekolah" value={f.nama} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><div className="grid sm:grid-cols-2 gap-4"><Input label="NPSN" value={f.npsn} onChange={(x) => setF({ ...f, npsn: x.target.value })} /><Input label="Telepon" value={f.telp} onChange={(x) => setF({ ...f, telp: x.target.value })} /></div><Textarea label="Alamat" value={f.alamat} onChange={(x) => setF({ ...f, alamat: x.target.value })} /><Field label="Logo Sekolah"><Dropzone accept="PNG atau JPG (maks. 2 MB)" /></Field></Card>
        <Card className="space-y-4"><CardTitle icon={<CalendarDays size={20} className="text-primary" />}>Periode & Kehadiran</CardTitle><Select label="Tahun Ajaran Aktif" value={f.ta} onChange={(x) => setF({ ...f, ta: x.target.value })} options={['', ...tahunAjaran]} /><Input label="Ambang Kehadiran Minimum (%)" type="number" value={f.min} onChange={(x) => setF({ ...f, min: Number(x.target.value) })} error={e.min} hint="Siswa di bawah ambang ini ditandai berisiko." /></Card></div>
        <div className="space-y-6"><Card><CardTitle icon={<Award size={20} className="text-primary" />}>Bobot Nilai</CardTitle><div className="grid grid-cols-2 gap-4">{(['tugas', 'kuis', 'uts', 'uas'] as const).map((k) => <Input key={k} label={`${k.toUpperCase().replace('TUGAS', 'Tugas').replace('KUIS', 'Kuis')} (%)`} type="number" value={b[k]} onChange={(x) => setB({ ...b, [k]: Number(x.target.value) })} />)}</div><div className="mt-4"><div className="flex justify-between text-sm font-semibold mb-1.5"><span>Total bobot</span><span className={tot === 100 ? 'text-ok' : 'text-danger'}>{tot}%</span></div><Progress value={Math.min(100, tot)} tone={tot === 100 ? 'green' : 'red'} /></div>{e.bobot && <p role="alert" className="text-danger text-xs font-semibold mt-2">{e.bobot}</p>}</Card>
          <Card><CardTitle icon={<ClipboardCheck size={20} className="text-primary" />}>Jam Pelajaran</CardTitle><div className="space-y-2">{jam.map((j, i) => <div key={i} className="flex items-center gap-3"><span className="w-20 text-sm font-bold">Jam ke-{j[0]}</span><input aria-label={`Waktu jam ke-${j[0]}`} value={j[1]} onChange={(x) => setJam(jam.map((y, z) => (z === i ? [y[0], x.target.value] : y)))} className="flex-1 h-10 rounded-xl border border-line px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>)}</div></Card></div></div></div>
  )
}
