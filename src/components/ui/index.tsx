import { useEffect, useMemo, useRef, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Info, Loader2, MoreVertical, Search, UploadCloud, User, X, FileText, Image as ImageIcon, PlayCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { fmtSlot, offeringTitle, pct, subjectById, jurusanNama, kelasById, teacherById, SEMESTER, type Offering } from '@/data'
import { useApp, useRole } from '@/store'

export const cn = (...a: (string | false | null | undefined | 0)[]) => a.filter(Boolean).join(' ')

export function Card({ className, hover, children, onClick, pad = true }: { className?: string; hover?: boolean; children: ReactNode; onClick?: () => void; pad?: boolean }) {
  return <div onClick={onClick} className={cn('bg-white border border-line rounded-[20px] shadow-soft transition-all duration-200', pad && 'p-6', hover && 'hover:-translate-y-0.5 hover:shadow-lift cursor-pointer', className)}>{children}</div>
}
export const CardTitle = ({ children, right, icon }: { children: ReactNode; right?: ReactNode; icon?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-lg font-bold flex items-center gap-2">{icon}{children}</h3>{right}</div>
)

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; loading?: boolean; icon?: ReactNode; to?: string; full?: boolean }
export function Btn({ variant = 'primary', loading, icon, to, full, children, className, disabled, onClick, ...p }: BtnProps) {
  const nav = useNavigate()
  const v = { primary: 'bg-primary text-white hover:bg-primary-dark', outline: 'border border-line bg-white text-ink hover:bg-gray-50', ghost: 'text-ink hover:bg-gray-100', danger: 'bg-danger text-white hover:bg-red-700' }[variant]
  return (
    <button {...p} disabled={disabled || loading} onClick={(e) => { onClick?.(e); if (to) nav(to) }}
      className={cn('h-10 px-4 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed', v, full && 'w-full', className)}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}{children}
    </button>
  )
}
export const IconBtn = ({ label, children, onClick, className }: { label: string; children: ReactNode; onClick?: () => void; className?: string }) => (
  <button aria-label={label} title={label} onClick={onClick} className={cn('w-9 h-9 rounded-xl inline-flex items-center justify-center hover:bg-gray-100 text-muted hover:text-ink', className)}>{children}</button>
)

const tones: Record<string, string> = {
  green: 'bg-green-100 text-green-800', blue: 'bg-blue-100 text-blue-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', gray: 'bg-gray-200 text-gray-700', orange: 'bg-orange-100 text-orange-800', purple: 'bg-purple-100 text-purple-800',
}
export const Badge = ({ tone = 'gray', children, className }: { tone?: string; children: ReactNode; className?: string }) => <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap', tones[tone], className)}>{children}</span>
const statusTone: Record<string, string> = { Hadir: 'green', Izin: 'blue', Sakit: 'amber', Alpa: 'red', 'Belum Dikumpulkan': 'gray', Dikumpulkan: 'blue', Terlambat: 'orange', Dinilai: 'green', Draft: 'gray', Aktif: 'green', Ditutup: 'red', Tersedia: 'green', Selesai: 'blue', 'Belum Dibuka': 'gray', Nonaktif: 'gray', Cuti: 'amber', Berisiko: 'red', Aman: 'green', Waspada: 'amber', Berlangsung: 'green', Terjadwal: 'blue', Dibuka: 'green' }
export const StatusBadge = ({ s }: { s: string }) => <Badge tone={statusTone[s] ?? 'gray'}>{s}</Badge>

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const parts = name.replace(/^(Bu|Pak|Drs\.|H\.)\s+/g, '').split(/[ ,]+/).filter(Boolean)
  const ini = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6
  const bg = ['#DCFCE7|#166534', '#DBEAFE|#1E40AF', '#FEF3C7|#92400E', '#FCE7F3|#9D174D', '#EDE9FE|#5B21B6', '#CFFAFE|#155E75'][hue].split('|')
  return <span className={cn('rounded-full inline-flex items-center justify-center font-bold shrink-0 select-none', className)} style={{ width: size, height: size, background: bg[0], color: bg[1], fontSize: Math.max(12, size * 0.38) }} aria-hidden>{ini}</span>
}

export function Field({ label, error, hint, children }: { label?: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="block">{label && <span className="block text-sm font-semibold mb-1.5">{label}</span>}{children}{error ? <span role="alert" className="block text-danger text-xs mt-1 font-semibold">{error}</span> : hint ? <span className="block text-muted text-xs mt-1">{hint}</span> : null}</label>
}
const inputCls = (err?: boolean) => cn('w-full h-11 rounded-xl border bg-white px-3.5 text-sm outline-none transition focus:ring-4 focus:ring-primary/20 focus:border-primary', err ? 'border-danger' : 'border-line')
export const Input = ({ label, error, hint, icon, ...p }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string; icon?: ReactNode }) => (
  <Field label={label} error={error} hint={hint}><div className="relative">{icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}<input {...p} className={cn(inputCls(!!error), !!icon && 'pl-10', p.className)} /></div></Field>
)
export const Select = ({ label, error, options, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: (string | { v: string; l: string })[] }) => (
  <Field label={label} error={error}><select {...p} className={cn(inputCls(!!error), 'pr-8', className)}>{options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}</select></Field>
)
export const Textarea = ({ label, error, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) => (
  <Field label={label} error={error}><textarea {...p} className={cn(inputCls(!!error), 'h-auto py-2.5 min-h-24 resize-y')} /></Field>
)
export const SearchBar = ({ value, onChange, placeholder, large, className }: { value: string; onChange: (v: string) => void; placeholder: string; large?: boolean; className?: string }) => (
  <div className={cn('relative', className)}><Search size={large ? 20 : 18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
    <input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn('w-full rounded-full border border-line bg-white pl-11 pr-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary text-sm', large ? 'h-12' : 'h-11')} /></div>
)
export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('w-11 h-6 rounded-full relative transition-colors shrink-0', on ? 'bg-primary' : 'bg-gray-300')}><span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} /></button>
)

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4 fade" onClick={onClose}>
      <div role="dialog" aria-modal aria-label={title} className={cn('pop bg-white rounded-[20px] shadow-lift w-full max-h-[90vh] flex flex-col', wide ? 'max-w-3xl' : 'max-w-lg')} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3"><h3 className="text-xl font-bold">{title}</h3><IconBtn label="Tutup" onClick={onClose}><X size={20} /></IconBtn></div>
        <div className="px-6 py-2 overflow-y-auto space-y-4">{children}</div>
        {footer && <div className="px-6 py-4 flex justify-end gap-3 border-t border-line mt-2">{footer}</div>}
      </div>
    </div>
  )
}
export function Drawer({ open, onClose, title, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 fade" onClick={onClose}>
      <aside role="dialog" aria-modal aria-label={title} className="slidein absolute right-0 top-0 h-full bg-white shadow-lift flex flex-col w-full rounded-l-[20px]" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-line shrink-0"><h3 className="text-lg font-bold">{title}</h3><IconBtn label="Tutup" onClick={onClose}><X size={20} /></IconBtn></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex justify-end gap-3 shrink-0">{footer}</div>}
      </aside>
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: (T | { v: T; l: string; n?: number })[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('flex gap-6 border-b border-line overflow-x-auto no-scrollbar', className)}>
      {tabs.map((t) => { const v = typeof t === 'string' ? t : t.v; const l = typeof t === 'string' ? t : t.l; const on = v === value
        return <button key={v} role="tab" aria-selected={on} onClick={() => onChange(v)} className={cn('pb-3 pt-1 text-[15px] border-b-[3px] -mb-px whitespace-nowrap transition-colors', on ? 'border-primary text-primary-dark font-bold' : 'border-transparent text-muted font-semibold hover:text-ink')}>{l}{typeof t !== 'string' && t.n != null && <span className="ml-1.5 text-xs bg-gray-100 text-muted rounded-full px-2 py-0.5">{t.n}</span>}</button> })}
    </div>
  )
}
// tab state sinkron dengan ?tab=
export function useTab(def: string, key = 'tab') {
  const [sp, setSp] = useSearchParams()
  return [sp.get(key) ?? def, (v: string) => setSp((p) => { p.set(key, v); return p }, { replace: true })] as const
}
export const Segmented = <T extends string>({ options, value, onChange }: { options: (T | { v: T; l: ReactNode })[]; value: T; onChange: (v: T) => void }) => (
  <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">{options.map((o) => { const v = typeof o === 'string' ? o : o.v; return <button key={v} onClick={() => onChange(v)} aria-pressed={v === value} className={cn('px-3 h-8 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5', v === value ? 'bg-white shadow-soft text-primary-dark' : 'text-muted hover:text-ink')}>{typeof o === 'string' ? o : o.l}</button> })}</div>
)
export const Chips = ({ options, value, onChange }: { options: { k: string; l: string; n?: number }[]; value: string; onChange: (k: string) => void }) => (
  <div className="flex flex-wrap gap-2">{options.map((o) => <button key={o.k} onClick={() => onChange(o.k)} aria-pressed={value === o.k} className={cn('h-9 px-3.5 rounded-full text-sm font-semibold border transition-colors', value === o.k ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink hover:bg-gray-50')}>{o.l}{o.n != null && <span className={cn('ml-1.5 text-xs rounded-full px-1.5 py-0.5', value === o.k ? 'bg-white/25' : 'bg-gray-100 text-muted')}>{o.n}</span>}</button>)}</div>
)

export function PageHeader({ crumbs, title, subtitle, actions }: { crumbs?: { l: string; to?: string }[]; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-muted mb-2">{crumbs.map((c, i) => <span key={i} className="flex items-center gap-1">{c.to ? <Link to={c.to} className="hover:text-primary-dark hover:underline">{c.l}</Link> : <span className="font-semibold text-ink">{c.l}</span>}{i < crumbs.length - 1 && <ChevronRight size={12} />}</span>)}</nav>}
        <h1 className="text-[28px] leading-9 font-extrabold">{title}</h1>
        {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
export const useCrumbs = (...rest: { l: string; to?: string }[]) => { const { cfg } = useRole(); return [{ l: 'Beranda', to: cfg.base + (cfg.base === '/tu' ? '/dashboard' : '/beranda') }, ...rest] }

export function EmptyIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden>
      <circle cx="80" cy="84" r="62" fill="#E8F6EC" /><rect x="40" y="48" width="80" height="62" rx="8" fill="#fff" stroke="#0B3D5F" strokeWidth="3" />
      <rect x="52" y="62" width="40" height="6" rx="3" fill="#BBE5C6" /><rect x="52" y="76" width="56" height="6" rx="3" fill="#D1D5DB" /><rect x="52" y="90" width="30" height="6" rx="3" fill="#D1D5DB" />
      <circle cx="118" cy="40" r="14" fill="#F59E0B" /><path d="M112 40l4 4 8-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 124h100" stroke="#0B3D5F" strokeWidth="3" strokeLinecap="round" /><circle cx="36" cy="40" r="5" fill="#2563EB" /><circle cx="130" cy="108" r="4" fill="#BBE5C6" />
    </svg>
  )
}
export const Empty = ({ title, text, action }: { title: string; text?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center text-center py-10 px-4"><EmptyIllustration size={130} /><h4 className="font-bold text-lg mt-2">{title}</h4>{text && <p className="text-muted text-sm mt-1 max-w-sm">{text}</p>}{action && <div className="mt-4">{action}</div>}</div>
)
export const Skel = ({ className }: { className?: string }) => <div className={cn('skeleton', className)} />
export const PageSkeleton = () => (
  <div className="space-y-6" aria-busy aria-label="Memuat"><Skel className="h-8 w-72" /><Skel className="h-4 w-96" /><div className="grid md:grid-cols-3 gap-6"><Skel className="h-40" /><Skel className="h-40" /><Skel className="h-40" /></div><Skel className="h-72" /></div>
)

export const Progress = ({ value, tone = 'blue', className }: { value: number; tone?: 'blue' | 'green' | 'amber' | 'red'; className?: string }) => (
  <div className={cn('h-1.5 rounded-full bg-gray-200 overflow-hidden', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={cn('h-full rounded-full transition-all duration-500', { blue: 'bg-accent', green: 'bg-primary', amber: 'bg-warn', red: 'bg-danger' }[tone])} style={{ width: `${value}%` }} /></div>
)
export function Ring({ value, size = 120, stroke = 12, label, sub, color = '#0B3D5F' }: { value: number; size?: number; stroke?: number; label?: string; sub?: string; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" /><circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, value)) / 100} style={{ transition: 'stroke-dashoffset .8s' }} /></svg>
      <div className="absolute text-center"><div className="font-extrabold leading-none" style={{ fontSize: size / 3.4 }}>{label ?? value}</div>{sub && <div className="text-xs text-muted mt-1">{sub}</div>}</div>
    </div>
  )
}
export const Stat = ({ icon, label, value, trend, tone = 'green', sub }: { icon: ReactNode; label: string; value: ReactNode; trend?: string; tone?: 'green' | 'blue' | 'amber' | 'red'; sub?: string }) => (
  <Card hover className="!p-5"><div className="flex items-start justify-between"><div><div className="text-sm text-muted font-semibold">{label}</div><div className="text-[28px] font-extrabold mt-1 leading-tight">{value}</div>{sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}</div>
    <span className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', { green: 'bg-primary-light text-primary-dark', blue: 'bg-blue-100 text-accent', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-danger' }[tone])}>{icon}</span></div>
    {trend && <div className={cn('text-xs font-bold mt-2', trend.startsWith('-') ? 'text-danger' : 'text-ok')}>{trend.startsWith('-') ? '▼' : '▲'} {trend.replace(/^[+-]/, '')} <span className="text-muted font-normal">dari bulan lalu</span></div>}</Card>
)
export function Accordion({ items, defaultOpen = 0 }: { items: { id: string; title: ReactNode; body: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? null)
  return <div className="space-y-3">{items.map((it) => { const on = open === it.id; return (
    <div key={it.id} className="bg-white border border-line rounded-2xl overflow-hidden shadow-soft">
      <button aria-expanded={on} onClick={() => setOpen(on ? null : it.id)} className="w-full flex items-center justify-between gap-3 text-left px-5 py-4 font-bold hover:bg-gray-50"><span className="flex-1">{it.title}</span>{on ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
      {on && <div className="px-5 pb-5 pt-1 border-t border-line fade">{it.body}</div>}</div>) })}</div>
}
export function Dropdown({ trigger, children, align = 'right', className }: { trigger: (o: boolean) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; className?: string }) {
  const [o, setO] = useState(false); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setO(false) }; const k = (e: KeyboardEvent) => e.key === 'Escape' && setO(false); document.addEventListener('mousedown', h); document.addEventListener('keydown', k); return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) } }, [])
  return <div ref={ref} className="relative"><div onClick={() => setO(!o)}>{trigger(o)}</div>{o && <div className={cn('pop absolute top-full mt-2 z-50 bg-white border border-line rounded-[20px] shadow-lift', align === 'right' ? 'right-0' : 'left-0', className)}>{children(() => setO(false))}</div>}</div>
}
export function RowMenu({ items }: { items: { l: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[] }) {
  return <Dropdown trigger={() => <button aria-label="Aksi baris" className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-muted"><MoreVertical size={18} /></button>} className="w-48 !rounded-2xl p-1.5">
    {(close) => items.map((i) => <button key={i.l} onClick={(e) => { e.stopPropagation(); close(); i.onClick() }} className={cn('w-full flex items-center gap-2.5 px-3 h-10 rounded-xl text-sm font-semibold hover:bg-gray-50 text-left', i.danger && 'text-danger hover:bg-red-50')}>{i.icon}{i.l}</button>)}</Dropdown>
}

// ---------- DataTable ----------
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
export const NameCell = ({ name, sub }: { name: string; sub?: string }) => <div className="flex items-center gap-3 min-w-0"><Avatar name={name} /><div className="min-w-0"><div className="font-bold truncate">{name}</div>{sub && <div className="text-xs text-muted">{sub}</div>}</div></div>

// ---------- ClassCard ----------
export function ClassCard({ o, mode, to }: { o: Offering; mode: 'siswa' | 'guru'; to: string }) {
  const nav = useNavigate(); const p = pct(o); const s = subjectById(o.subjectId); const k = kelasById(o.kelasId); const g = teacherById(o.guru)
  const tone = p >= 75 ? 'blue' : p >= 50 ? 'amber' : 'red'
  return (
    <Card hover onClick={() => nav(to)} className="flex flex-col !p-5 group" >
      <h4 className="font-extrabold text-[17px] leading-snug uppercase group-hover:text-primary-dark">{offeringTitle(o)}</h4>
      <p className="text-sm font-semibold mt-1">{jurusanNama(k.jurusan)}</p>
      <p className="text-sm italic text-muted">{o.semester}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2"><User size={16} className="text-muted shrink-0" /><span>{g.sapaan}</span>{o.co.length > 0 && <Link onClick={(e) => e.stopPropagation()} to={to} className="underline text-accent">dan {o.co.length} lainnya</Link>}</div>
        <div className="flex items-center gap-2"><Calendar size={16} className="text-muted shrink-0" /><span>{fmtSlot(o.jadwal[0]).replace(':', ',')}</span></div>
      </div>
      <div className="border-t border-line mt-4 pt-3">
        {mode === 'siswa' ? (<>
          <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-semibold">Kehadiran: {o.hadir} dari {o.done} sesi <span title="Jumlah sesi yang kamu hadiri dibanding sesi yang sudah berlangsung"><Info size={14} className="text-muted" /></span></span><span className="font-extrabold">{p}%</span></div>
          <Progress value={p} tone={tone} className="mt-2" /></>) : (<>
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">Pertemuan: {o.done} dari {o.total} sesi</span><span className="font-extrabold">Rata-rata nilai {o.rata}</span></div>
          <Progress value={Math.round((o.done / o.total) * 100)} className="mt-2" /></>)}
      </div>
      <span className="hidden">{s.nama}</span>
    </Card>
  )
}

// ---------- Dropzone & upload ----------
export function Dropzone({ multiple, accept = 'PDF, DOCX, PNG, JPG, ZIP (maks. 20 MB)', onDone }: { multiple?: boolean; accept?: string; onDone?: (n: number) => void }) {
  const [files, setFiles] = useState<{ name: string; size: string; p: number }[]>([]); const [drag, setDrag] = useState(false); const input = useRef<HTMLInputElement>(null)
  const add = (list: FileList | null) => {
    if (!list || !list.length) return
    const nf = [...list].slice(0, multiple ? 10 : 1).map((f) => ({ name: f.name, size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1e3))} KB`, p: 0 }))
    setFiles(multiple ? [...files, ...nf] : nf)
    const iv = setInterval(() => setFiles((fs) => { const n = fs.map((f) => ({ ...f, p: Math.min(100, f.p + 8 + Math.random() * 14) })); if (n.every((f) => f.p >= 100)) { clearInterval(iv); onDone?.(n.length) } return n }), 220)
  }
  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }} onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        className={cn('border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition', drag ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary hover:bg-gray-50')}>
        <UploadCloud className="mx-auto text-primary" size={32} /><p className="font-bold mt-2 text-sm">Tarik dan lepas berkas di sini</p><p className="text-xs text-muted">atau klik untuk memilih berkas • {accept}</p>
        <input ref={input} type="file" multiple={multiple} hidden onChange={(e) => add(e.target.files)} />
      </div>
      {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((f, i) => <li key={i} className="flex items-center gap-3 border border-line rounded-xl p-3"><FileText size={20} className="text-accent shrink-0" /><div className="flex-1 min-w-0"><div className="flex justify-between text-sm"><span className="font-semibold truncate">{f.name}</span><span className="text-muted">{f.p >= 100 ? f.size : `${Math.round(f.p)}%`}</span></div><Progress value={f.p} tone={f.p >= 100 ? 'green' : 'blue'} className="mt-1.5" /></div>
        {f.p >= 100 ? <CheckCircle2 size={18} className="text-ok" /> : null}<IconBtn label="Hapus berkas" onClick={() => setFiles(files.filter((_, j) => j !== i))}><Trash2 size={16} /></IconBtn></li>)}</ul>}
    </div>
  )
}
export const FileIcon = ({ t, size = 20 }: { t: string; size?: number }) => t === 'dokumen' ? <FileText size={size} /> : t === 'gambar' ? <ImageIcon size={size} /> : <PlayCircle size={size} />
export const fileTone = (t: string) => t === 'dokumen' ? 'bg-blue-100 text-accent' : t === 'gambar' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-danger'

export function Readonly() { const { role } = useApp(); return role === 'wali' || role === 'kepsek' ? <Badge tone="blue">Mode hanya-lihat</Badge> : null }
export const isRO = (r: string | null) => r === 'wali' || r === 'kepsek'
export const SEM = SEMESTER
const BOOT = Date.now()
export const simNow = () => new Date(2026, 9, 29, 9, 30).getTime() + (Date.now() - BOOT)
export function useCountdown(target: Date) {
  const [now, setNow] = useState(simNow()); useEffect(() => { const i = setInterval(() => setNow(simNow()), 1000); return () => clearInterval(i) }, [])
  const d = Math.max(0, target.getTime() - now); return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 }
}
export const download = (name: string, content = 'Data diekspor dari Sistem Pembelajaran Digital SMK Negeri 2 Indramayu') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content])); a.download = name; a.click() }
export { HeroBannerOmbak } from './HeroBannerOmbak'
