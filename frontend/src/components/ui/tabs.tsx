import { useSearchParams } from 'react-router-dom'
import { cn } from './cn'

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
