import { cn } from './cn'

export const Chips = ({ options, value, onChange }: { options: { k: string; l: string; n?: number }[]; value: string; onChange: (k: string) => void }) => (
  <div className="flex flex-wrap gap-2">{options.map((o) => <button key={o.k} onClick={() => onChange(o.k)} aria-pressed={value === o.k} className={cn('h-9 px-3.5 rounded-full text-sm font-semibold border transition-colors', value === o.k ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink hover:bg-gray-50')}>{o.l}{o.n != null && <span className={cn('ml-1.5 text-xs rounded-full px-1.5 py-0.5', value === o.k ? 'bg-white/25' : 'bg-gray-100 text-muted')}>{o.n}</span>}</button>)}</div>
)
