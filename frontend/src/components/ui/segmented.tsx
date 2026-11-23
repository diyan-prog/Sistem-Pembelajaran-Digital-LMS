import type { ReactNode } from 'react'
import { cn } from './cn'

export const Segmented = <T extends string>({ options, value, onChange }: { options: (T | { v: T; l: ReactNode })[]; value: T; onChange: (v: T) => void }) => (
  <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">{options.map((o) => { const v = typeof o === 'string' ? o : o.v; return <button key={v} onClick={() => onChange(v)} aria-pressed={v === value} className={cn('px-3 h-8 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5', v === value ? 'bg-white shadow-soft text-primary-dark' : 'text-muted hover:text-ink')}>{typeof o === 'string' ? o : o.l}</button> })}</div>
)
