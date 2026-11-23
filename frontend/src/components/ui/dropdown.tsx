import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from './cn'

export function Dropdown({ trigger, children, align = 'right', className }: { trigger: (o: boolean) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; className?: string }) {
  const [o, setO] = useState(false); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setO(false) }; const k = (e: KeyboardEvent) => e.key === 'Escape' && setO(false); document.addEventListener('mousedown', h); document.addEventListener('keydown', k); return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) } }, [])
  return <div ref={ref} className="relative"><div onClick={() => setO(!o)}>{trigger(o)}</div>{o && <div className={cn('pop absolute top-full mt-2 z-50 bg-white border border-line rounded-[20px] shadow-lift', align === 'right' ? 'right-0' : 'left-0', className)}>{children(() => setO(false))}</div>}</div>
}
