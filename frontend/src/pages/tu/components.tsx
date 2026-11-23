import { useEffect, useState } from 'react'
import { AlertTriangle, Download, Eye, FileSpreadsheet, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Badge, Btn, DataTable, Drawer, Dropzone, Field, Input, Modal, PageHeader, Select, Toggle, cn, download, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'

type F = { k: string; l: string; type?: string; options?: (string | { v: string; l: string })[]; req?: boolean; validate?: (v: string, all: Record<string, string>) => string }
type FD = { k: string; l: string; options: string[]; get: (r: any) => string }
export function Crud<T extends { id: string }>({ singular, title, subtitle, rows: init, cols, fields, searchText, filterDefs, detail, toForm, fromForm, importer, onRowOpen, sidebarHint, onFetch, onCreate, onUpdate, onDelete }: {
  singular: string; title: string; subtitle: string; rows: T[]; cols: any[]; fields: F[]; searchText: (r: T) => string; filterDefs?: FD[]
  detail?: (r: T) => React.ReactNode; toForm: (r: T) => Record<string, string>; fromForm: (f: Record<string, string>, old?: T) => T; importer?: boolean; onRowOpen?: (r: T) => void; sidebarHint?: string
  onFetch?: () => Promise<T[]>; onCreate?: (data: any) => Promise<T>; onUpdate?: (id: string, data: any) => Promise<void>; onDelete?: (id: string) => Promise<void>
}) {
  const { toast, confirm } = useApp(); const [rows, setRows] = useState(init); const [flt, setFlt] = useState<Record<string, string>>({}); const [modal, setModal] = useState<null | { edit?: T }>(null); const [view, setView] = useState<T | null>(null); const [imp, setImp] = useState(false)
  const [f, setF] = useState<Record<string, string>>({}); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(false)

  const load = async () => { if (!onFetch) return; setLoading(true); try { setRows(await onFetch()) } catch (err: any) { toast(err.message, 'err') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const shown = rows.filter((r) => (filterDefs ?? []).every((d) => !flt[d.k] || flt[d.k] === 'Semua' || d.get(r) === flt[d.k]))
  const open = (r?: T) => { setF(r ? toForm(r) : Object.fromEntries(fields.map((x) => [x.k, x.options ? (typeof x.options[0] === 'string' ? (x.options[0] as string) : (x.options[0] as { v: string }).v) : '']))); setE({}); setModal({ edit: r }) }
  
  const save = async () => { const x: Record<string, string> = {}; fields.forEach((d) => { const v = (f[d.k] ?? '').trim(); if (d.req && !v) x[d.k] = `${d.l} wajib diisi`; else if (d.validate && v) { const m = d.validate(v, f); if (m) x[d.k] = m } }); setE(x); if (Object.keys(x).length) return
    setBusy(true); try {
      const edit = modal!.edit;
      if (edit) {
        if (onUpdate) await onUpdate(edit.id, f);
        setRows(rows.map((r) => (r.id === edit.id ? fromForm(f, edit) : r)));
      } else {
        const newData = onCreate ? await onCreate(f) : fromForm(f);
        setRows([newData, ...rows]);
      }
      setModal(null); toast(edit ? `${singular} berhasil diperbarui` : `${singular} berhasil ditambahkan`)
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) } }

  const del = (r: T) => confirm({ title: `Hapus ${singular}?`, message: `Data ${singular.toLowerCase()} akan dihapus permanen dan tidak dapat dikembalikan.`, danger: true, onOk: async () => { 
    try { if (onDelete) await onDelete(r.id); setRows(rows.filter((x) => x.id !== r.id)); toast(`${singular} berhasil dihapus`) } catch (err: any) { toast(err.message, 'err') } 
  } })
  return (
    <div><PageHeader crumbs={useCrumbs({ l: title })} title={title} subtitle={subtitle} actions={<>{importer && <Btn variant="outline" icon={<Upload size={18} />} onClick={() => setImp(true)}>Import Excel</Btn>}<Btn variant="outline" icon={<Download size={18} />} onClick={() => { download(`${title}.csv`); toast('Data berhasil diekspor') }}>Ekspor</Btn><Btn icon={<Plus size={18} />} onClick={() => open()}>Tambah {singular}</Btn></>} />
      <DataTable rows={shown} cols={cols} pageSize={10} selectable searchText={searchText} searchPlaceholder={`Cari ${singular.toLowerCase()}...`} onRow={onRowOpen ?? ((r) => setView(r))} loading={loading}
        filters={filterDefs?.map((d) => <Select key={d.k} aria-label={d.l} value={flt[d.k] ?? 'Semua'} onChange={(ev) => setFlt({ ...flt, [d.k]: ev.target.value })} options={['Semua', ...d.options]} className="!w-44 !h-11" />)}
        bulk={[{ l: 'Hapus', icon: <Trash2 size={15} />, danger: true, onClick: (ids, clear) => confirm({ title: `Hapus ${ids.length} Data?`, message: 'Seluruh data terpilih akan dihapus permanen.', danger: true, onOk: () => { setRows(rows.filter((r) => !ids.includes(r.id))); clear(); toast(`${ids.length} data berhasil dihapus`) } }) }, { l: 'Ekspor', icon: <Download size={15} />, onClick: (ids, clear) => { download('terpilih.csv'); toast(`${ids.length} data diekspor`); clear() } }]}
        actions={(r) => [{ l: 'Lihat Detail', icon: <Eye size={16} />, onClick: () => (onRowOpen ? onRowOpen(r) : setView(r)) }, { l: 'Edit', icon: <Pencil size={16} />, onClick: () => open(r) }, { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => del(r) }]} />
      <Modal open={!!modal} onClose={() => setModal(null)} wide title={modal?.edit ? `Edit ${singular}` : `Tambah ${singular}`} footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn loading={busy} icon={<Save size={16} />} onClick={save}>Simpan</Btn></>}>
        <div className="grid sm:grid-cols-2 gap-4">{fields.map((d) => d.options ? <Select key={d.k} label={d.l} value={f[d.k] ?? ''} onChange={(ev) => setF({ ...f, [d.k]: ev.target.value })} options={d.options} error={e[d.k]} /> : <Input key={d.k} label={d.l} type={d.type} value={f[d.k] ?? ''} onChange={(ev) => setF({ ...f, [d.k]: ev.target.value })} error={e[d.k]} />)}</div></Modal>
      <Drawer open={!!view && !!detail} onClose={() => setView(null)} title={`Detail ${singular}`} footer={view && <><Btn variant="outline" icon={<Pencil size={16} />} onClick={() => { const r = view; setView(null); open(r) }}>Edit</Btn><Btn variant="danger" icon={<Trash2 size={16} />} onClick={() => { const r = view; setView(null); del(r) }}>Hapus</Btn></>}>{view && detail?.(view)}</Drawer>
      {importer && <ImportModal open={imp} onClose={() => setImp(false)} />}
      <span className="hidden">{sidebarHint}</span>
    </div>
  )
}
function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp(); const [done, setDone] = useState(false)
  const prev = [['2425010101', 'Alya Safitri', 'X RPL 1', 'OK'], ['2425010102', 'Bagus Prakoso', 'X RPL 1', 'OK'], ['2425010102', 'Cindy Maharani', 'XI TKJ 1', 'NIS duplikat pada baris 3'], ['2425010104', 'Doni Ramadhan', 'XI AKL 9', 'Kelas tidak ditemukan'], ['2425010105', 'Eka Fitriani', 'XI DKV 1', 'OK']]
  const close = () => { setDone(false); onClose() }
  return <Modal open={open} onClose={close} wide title="Import Data Siswa dari Excel" footer={<><Btn variant="outline" onClick={close}>Batal</Btn><Btn disabled={!done} onClick={() => { close(); toast('3 siswa berhasil diimpor, 2 baris dilewati') }}>Impor 3 Baris Valid</Btn></>}>
    <div className="flex items-center gap-3 bg-primary-light rounded-2xl p-4"><FileSpreadsheet className="text-primary-dark" /><div className="flex-1 text-sm"><b>Template Excel</b><div className="text-muted">Gunakan format kolom: NIS, Nama, Kelas, Jenis Kelamin.</div></div><Btn variant="outline" icon={<Download size={16} />} onClick={() => { download('template-siswa.csv', 'NIS,Nama,Kelas,Jenis Kelamin'); toast('Template diunduh', 'info') }}>Unduh Template</Btn></div>
    <Dropzone accept="XLSX atau CSV (maks. 5 MB)" onDone={() => setDone(true)} />
    {done && <div className="fade"><div className="flex items-center gap-2 text-sm mb-2"><AlertTriangle size={16} className="text-warn" /><b>Pratinjau: 3 baris valid, 2 baris bermasalah</b></div><div className="border border-line rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-muted text-left"><tr><th className="p-2.5">NIS</th><th>Nama</th><th>Kelas</th><th>Status</th></tr></thead><tbody>{prev.map((r, i) => <tr key={i} className={cn('border-t border-line', r[3] !== 'OK' && 'bg-red-50')}><td className="p-2.5">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3] === 'OK' ? <Badge tone="green">Valid</Badge> : <span className="text-danger text-xs font-semibold">{r[3]}</span>}</td></tr>)}</tbody></table></div></div>}
  </Modal>
}
export const Det = ({ items }: { items: [string, React.ReactNode][] }) => <dl className="space-y-3">{items.map(([a, b]) => <div key={a} className="flex justify-between gap-4 border-b border-line pb-2.5 text-sm"><dt className="text-muted">{a}</dt><dd className="font-bold text-right">{b}</dd></div>)}</dl>
export const nm = (v: string) => (v.trim().length < 3 ? 'Nama minimal 3 karakter' : '')
export const em = (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? '' : 'Format email tidak valid')
