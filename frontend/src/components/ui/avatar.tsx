import { cn } from './cn'

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const parts = name.replace(/^(Bu|Pak|Drs\.|H\.)\s+/g, '').split(/[ ,]+/).filter(Boolean)
  const ini = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6
  const bg = ['#DCFCE7|#166534', '#DBEAFE|#1E40AF', '#FEF3C7|#92400E', '#FCE7F3|#9D174D', '#EDE9FE|#5B21B6', '#CFFAFE|#155E75'][hue].split('|')
  return <span className={cn('rounded-full inline-flex items-center justify-center font-bold shrink-0 select-none', className)} style={{ width: size, height: size, background: bg[0], color: bg[1], fontSize: Math.max(12, size * 0.38) }} aria-hidden>{ini}</span>
}
