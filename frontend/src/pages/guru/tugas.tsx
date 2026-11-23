import { useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bold, Eye, Italic, List as ListIcon, ListOrdered, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react'
import { Btn, Card, Chips, DataTable, Dropzone, Field, Input, PageHeader, Progress, StatusBadge, Toggle, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { fmtBatas, offeringById, offeringTitle, tugas, tugasById } from '@/data'
import { mine } from './common'

export function TugasListGuru({ offId }: { offId?: string }) {
  const { toast, confirm } = useApp(); const nav = useNavigate(); const [items, setItems] = useState(() => tugas.filter((t) => (offId ? t.off === offId : mine().some((o) => o.id === t.off))))
  const [st, setSt] = useState('Semua')
  const rows = items.filter((t) => st === 'Semua' || t.gStatus === st)
  return (
    <div className="space-y-4"><div className="flex flex-wrap justify-between gap-3"><Chips value={st} onChange={setSt} options={['Semua', 'Draft', 'Aktif', 'Ditutup'].map((k) => ({ k, l: k, n: k === 'Semua' ? items.length : items.filter((t) => t.gStatus === k).length }))} /><Btn icon={<Plus size={18} />} to={`/guru/tugas/baru${offId ? `?off=${offId}` : ''}`}>Buat Tugas</Btn></div>
      <DataTable rows={rows} pageSize={10} searchText={(t) => t.judul} searchPlaceholder="Cari judul tugas" onRow={(t) => nav(`/guru/penilaian?tugas=${t.id}`)}
        cols={[{ key: 'judul', header: 'Judul Tugas', sort: (t) => t.judul, render: (t) => <div><b>{t.judul}</b><div className="text-xs text-muted uppercase">{offeringTitle(offeringById(t.off))}</div></div> }, { key: 'batas', header: 'Batas', sort: (t) => t.batas, render: (t) => <span className="text-sm">{fmtBatas(t.batas)}</span> }, { key: 'gStatus', header: 'Status', render: (t) => <StatusBadge s={t.gStatus} /> }, { key: 'terkumpul', header: 'Terkumpul', sort: (t) => t.terkumpul, render: (t) => <div className="w-36"><div className="text-xs font-semibold mb-1">{t.terkumpul} / 25 siswa</div><Progress value={(t.terkumpul / 25) * 100} tone="green" /></div> }]}
        actions={(t) => [{ l: 'Lihat Pengumpulan', icon: <Eye size={16} />, onClick: () => nav(`/guru/penilaian?tugas=${t.id}`) }, { l: 'Edit', icon: <Pencil size={16} />, onClick: () => nav(`/guru/tugas/${t.id}/edit`) }, { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => confirm({ title: 'Hapus Tugas?', message: `Tugas "${t.judul}" beserta seluruh pengumpulan akan dihapus.`, danger: true, onOk: () => { setItems(items.filter((x) => x.id !== t.id)); toast('Tugas berhasil dihapus') } }) }]} /></div>
  )
}
export const TugasListPage = () => <div><PageHeader crumbs={useCrumbs({ l: 'Daftar Tugas' })} title="Daftar Tugas" subtitle="Semua tugas dari kelas yang Anda ampu" /><TugasListGuru /></div>

export function TugasForm() {
  const { id } = useParams(); const [sp] = useSearchParams(); const t = id ? tugasById(id) : null; const nav = useNavigate(); const { toast } = useApp()
  const [f, setF] = useState({ judul: t?.judul ?? '', kelas: t ? [t.off] : sp.get('off') ? [sp.get('off')!] : [], mulai: '2026-10-29T07:00', batas: t?.batas ?? '2026-11-06T23:59', telat: true, maks: t?.maks ?? 100 }); const [e, setE] = useState<Record<string, string>>({}); const ed = useRef<HTMLDivElement>(null); const [busy, setBusy] = useState('')
  const submit = (pub: boolean) => { const x: Record<string, string> = {}; if (f.judul.trim().length < 5) x.judul = 'Judul minimal 5 karakter'; if (!(ed.current?.innerText.trim().length)) x.ins = 'Instruksi tugas wajib diisi'; if (!f.kelas.length) x.kelas = 'Pilih minimal satu kelas tujuan'; if (f.batas <= f.mulai) x.batas = 'Batas harus setelah waktu mulai'; if (f.maks < 1 || f.maks > 100) x.maks = 'Nilai maksimal 1 - 100'; setE(x); if (Object.keys(x).length) return; setBusy(pub ? 'p' : 'd'); setTimeout(() => { toast(pub ? 'Tugas berhasil dipublikasikan' : 'Draft tugas tersimpan'); nav('/guru/tugas') }, 700) }
  const cmd = (c: string) => { ed.current?.focus(); document.execCommand(c) }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Daftar Tugas', to: '/guru/tugas' }, { l: t ? 'Edit Tugas' : 'Buat Tugas' })} title={t ? 'Edit Tugas' : 'Buat Tugas'} subtitle="Lengkapi detail tugas untuk siswa" actions={<><Btn variant="outline" loading={busy === 'd'} onClick={() => submit(false)} icon={<Save size={18} />}>Simpan Draft</Btn><Btn loading={busy === 'p'} onClick={() => submit(true)} icon={<Send size={18} />}>Publikasikan</Btn></>} />
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start"><Card className="space-y-5"><Input label="Judul Tugas" value={f.judul} onChange={(x) => setF({ ...f, judul: x.target.value })} error={e.judul} />
        <Field label="Instruksi" error={e.ins}><div className={cn('border rounded-xl overflow-hidden', e.ins ? 'border-danger' : 'border-line focus-within:ring-4 focus-within:ring-primary/20 focus-within:border-primary')}><div className="flex gap-1 p-2 border-b border-line bg-gray-50">{[['bold', <Bold size={16} />, 'Tebal'], ['italic', <Italic size={16} />, 'Miring'], ['insertUnorderedList', <ListIcon size={16} />, 'Daftar poin'], ['insertOrderedList', <ListOrdered size={16} />, 'Daftar nomor']].map(([c, i, l]) => <button type="button" key={c as string} aria-label={l as string} onClick={() => cmd(c as string)} className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center">{i}</button>)}</div><div ref={ed} contentEditable suppressContentEditableWarning role="textbox" aria-label="Instruksi" className="rte min-h-40 p-3.5 text-sm leading-6 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: t ? t.instruksi.replace(/\n/g, '<br>') : '' }} /></div></Field>
        <Field label="Lampiran"><Dropzone multiple /></Field></Card>
        <Card className="space-y-4"><Field label="Kelas Tujuan" error={e.kelas}><div className="space-y-2">{mine().map((o) => <label key={o.id} className="flex items-center gap-3 border border-line rounded-xl p-3 text-sm font-semibold hover:bg-gray-50"><input type="checkbox" className="w-4 h-4 accent-[#0B3D5F]" checked={f.kelas.includes(o.id)} onChange={() => setF({ ...f, kelas: f.kelas.includes(o.id) ? f.kelas.filter((k) => k !== o.id) : [...f.kelas, o.id] })} />{offeringTitle(o)}</label>)}</div></Field>
          <Input label="Mulai" type="datetime-local" value={f.mulai} onChange={(x) => setF({ ...f, mulai: x.target.value })} /><Input label="Batas Pengumpulan" type="datetime-local" value={f.batas} onChange={(x) => setF({ ...f, batas: x.target.value })} error={e.batas} />
          <Input label="Nilai Maksimal" type="number" value={f.maks} onChange={(x) => setF({ ...f, maks: Number(x.target.value) })} error={e.maks} />
          <div className="flex items-center justify-between border border-line rounded-xl p-3"><div><b className="text-sm">Izinkan terlambat</b><div className="text-xs text-muted">Siswa tetap dapat mengumpulkan setelah batas</div></div><Toggle on={f.telat} onChange={(v) => setF({ ...f, telat: v })} label="Izinkan terlambat" /></div></Card></div></div>
  )
}
