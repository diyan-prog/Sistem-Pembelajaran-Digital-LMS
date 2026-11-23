import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from './cn'

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
