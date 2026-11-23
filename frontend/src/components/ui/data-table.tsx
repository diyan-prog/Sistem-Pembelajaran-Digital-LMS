import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, X } from 'lucide-react'
import { Empty } from './empty'
import { IconBtn } from './button'
import { RowMenu } from './row-menu'
import { SearchBar } from './search-bar'
import { cn } from './cn'

export type Col<T> = { key: string; header: string; render?: (r: T) => ReactNode; sort?: (r: T) => string | number; className?: string; hideSm?: boolean }
export function DataTable<T extends { id: string | number }>({ rows, cols, searchText, searchPlaceholder = 'Cari...', filters, pageSize = 10, selectable, bulk, actions, onRow, empty, loading }: {
  rows: T[]; cols: Col<T>[]; searchText?: (r: T) => string; searchPlaceholder?: string; filters?: ReactNode; pageSize?: number; selectable?: boolean
  bulk?: { l: string; icon?: ReactNode; danger?: boolean; onClick: (ids: (string | number)[], clear: () => void) => void }[]
  actions?: (r: T) => { l: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[]; onRow?: (r: T) => void; empty?: string; loading?: boolean
}) {
  const [q, setQ] = useState(''); const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null); const [page, setPage] = useState(1); const [sel, setSel] = useState<Set<string | number>>(new Set())
  const data = useMemo(() => {
    let r = rows; if (q && searchText) r = r.filter((x) => searchText(x).toLowerCase().includes(q.toLowerCase()))
    if (sort) { const c = cols.find((c) => c.key === sort.k); if (c?.sort) r = [...r].sort((a, b) => { const x = c.sort!(a), y = c.sort!(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.d }) }
    return r
  }, [rows, q, sort, cols, searchText])
  const pages = Math.max(1, Math.ceil(data.length / pageSize)); const cur = Math.min(page, pages)
  const view = data.slice((cur - 1) * pageSize, cur * pageSize)
  useEffect(() => setPage(1), [q, rows.length])
  const allSel = view.length > 0 && view.every((r) => sel.has(r.id))
  return (
    <div className="bg-white border border-line rounded-[20px] shadow-soft overflow-hidden relative">
      {(searchText || filters) && <div className="p-4 flex flex-wrap items-center gap-3 border-b border-line">{searchText && <SearchBar value={q} onChange={setQ} placeholder={searchPlaceholder} className="w-full sm:w-80" />}{filters}<span className="ml-auto text-sm text-muted">{data.length} data</span></div>}
      <div className="overflow-auto max-h-[640px]">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="sticky top-0 z-10 bg-gray-50"><tr className="text-left text-muted text-xs uppercase tracking-wide">
            {selectable && <th className="w-12 pl-4"><input type="checkbox" aria-label="Pilih semua" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set([...sel, ...view.map((r) => r.id)]))} className="w-4 h-4 accent-[#0B3D5F]" /></th>}
            {cols.map((c) => <th key={c.key} className={cn('px-4 h-12 font-bold', c.className)}>{c.sort ? <button onClick={() => setSort(sort?.k === c.key ? { k: c.key, d: (sort.d * -1) as 1 | -1 } : { k: c.key, d: 1 })} className="inline-flex items-center gap-1 uppercase hover:text-ink">{c.header}{sort?.k === c.key ? (sort.d === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={13} />}</button> : c.header}</th>)}
            {actions && <th className="w-14" />}
          </tr></thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id} onClick={() => onRow?.(r)} className={cn('h-14 border-t border-line hover:bg-primary-light/50 transition-colors', onRow && 'cursor-pointer', sel.has(r.id) && 'bg-primary-light/60')}>
                {selectable && <td className="pl-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label="Pilih baris" checked={sel.has(r.id)} onChange={() => { const n = new Set(sel); n.has(r.id) ? n.delete(r.id) : n.add(r.id); setSel(n) }} className="w-4 h-4 accent-[#0B3D5F]" /></td>}
                {cols.map((c) => <td key={c.key} className={cn('px-4', c.className)}>{c.render ? c.render(r) : String((r as never)[c.key] ?? '')}</td>)}
                {actions && <td className="pr-3" onClick={(e) => e.stopPropagation()}><RowMenu items={actions(r)} /></td>}
              </tr>))}
            {view.length === 0 && <tr><td colSpan={cols.length + 2}><Empty title={empty ?? 'Data tidak ditemukan'} text="Coba ubah kata kunci atau filter pencarian." /></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-line flex items-center justify-between text-sm text-muted">
        <span>Menampilkan {data.length ? (cur - 1) * pageSize + 1 : 0}-{Math.min(cur * pageSize, data.length)} dari {data.length}</span>
        <div className="flex items-center gap-1"><IconBtn label="Halaman sebelumnya" onClick={() => setPage(Math.max(1, cur - 1))}><ChevronLeft size={18} /></IconBtn><span className="px-2 font-semibold text-ink">{cur} / {pages}</span><IconBtn label="Halaman berikutnya" onClick={() => setPage(Math.min(pages, cur + 1))}><ChevronRight size={18} /></IconBtn></div>
      </div>
      {sel.size > 0 && bulk && (
        <div className="pop fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-ink text-white rounded-2xl shadow-lift px-5 py-3 flex items-center gap-4"><span className="text-sm font-semibold">{sel.size} dipilih</span>
          {bulk.map((b) => <button key={b.l} onClick={() => b.onClick([...sel], () => setSel(new Set()))} className={cn('h-9 px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2', b.danger ? 'bg-danger' : 'bg-white/15 hover:bg-white/25')}>{b.icon}{b.l}</button>)}
          <button aria-label="Batalkan pilihan" onClick={() => setSel(new Set())}><X size={18} /></button></div>)}
    </div>
  )
}
