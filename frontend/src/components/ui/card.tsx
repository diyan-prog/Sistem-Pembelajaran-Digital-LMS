import type { ReactNode } from 'react'
import { cn } from './cn'

export function Card({ className, hover, children, onClick, pad = true }: { className?: string; hover?: boolean; children: ReactNode; onClick?: () => void; pad?: boolean }) {
  return <div onClick={onClick} className={cn('bg-white border border-line rounded-[20px] shadow-soft transition-all duration-200', pad && 'p-6', hover && 'hover:-translate-y-0.5 hover:shadow-lift cursor-pointer', className)}>{children}</div>
}
export const CardTitle = ({ children, right, icon }: { children: ReactNode; right?: ReactNode; icon?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-lg font-bold flex items-center gap-2">{icon}{children}</h3>{right}</div>
)
