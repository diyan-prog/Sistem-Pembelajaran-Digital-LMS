import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function Accordion({ items, defaultOpen = 0 }: { items: { id: string; title: ReactNode; body: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? null)
  return <div className="space-y-3">{items.map((it) => { const on = open === it.id; return (
    <div key={it.id} className="bg-white border border-line rounded-2xl overflow-hidden shadow-soft">
      <button aria-expanded={on} onClick={() => setOpen(on ? null : it.id)} className="w-full flex items-center justify-between gap-3 text-left px-5 py-4 font-bold hover:bg-gray-50"><span className="flex-1">{it.title}</span>{on ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
      {on && <div className="px-5 pb-5 pt-1 border-t border-line fade">{it.body}</div>}</div>) })}</div>
}
