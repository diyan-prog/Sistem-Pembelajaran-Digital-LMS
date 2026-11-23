import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconBtn } from './button'

export function Drawer({ open, onClose, title, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 fade" onClick={onClose}>
      <aside role="dialog" aria-modal aria-label={title} className="slidein absolute right-0 top-0 h-full bg-white shadow-lift flex flex-col w-full rounded-l-[20px]" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-line shrink-0"><h3 className="text-lg font-bold">{title}</h3><IconBtn label="Tutup" onClick={onClose}><X size={20} /></IconBtn></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex justify-end gap-3 shrink-0">{footer}</div>}
      </aside>
    </div>
  )
}
