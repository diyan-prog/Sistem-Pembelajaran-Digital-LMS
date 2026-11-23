import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconBtn } from './button'
import { cn } from './cn'

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4 fade" onClick={onClose}>
      <div role="dialog" aria-modal aria-label={title} className={cn('pop bg-white rounded-[20px] shadow-lift w-full max-h-[90vh] flex flex-col', wide ? 'max-w-3xl' : 'max-w-lg')} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3"><h3 className="text-xl font-bold">{title}</h3><IconBtn label="Tutup" onClick={onClose}><X size={20} /></IconBtn></div>
        <div className="px-6 py-2 overflow-y-auto space-y-4">{children}</div>
        {footer && <div className="px-6 py-4 flex justify-end gap-3 border-t border-line mt-2">{footer}</div>}
      </div>
    </div>
  )
}
